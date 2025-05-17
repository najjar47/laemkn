class Game {
    constructor() {
        this.initialize();
        this.createScene();
        this.createLights();
        this.createStarfield();
        this.createShip();
        this.spaceObjects = [];
        this.gameStarted = false;
        this.setupEventListeners();
        this.animate();
    }

    initialize() {
        // إعداد المشهد والكاميرا والعارض
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        
        // إضافة تأثير ما بعد المعالجة
        this.composer = new THREE.EffectComposer(this.renderer);
        this.renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        // إضافة تأثير التوهج
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // قوة التوهج
            0.4,  // نصف قطر التوهج
            0.85  // عتبة التوهج
        );
        this.composer.addPass(bloomPass);
    }

    createScene() {
        this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
        this.camera.position.set(0, 2, 10);
        this.camera.lookAt(0, 0, 0);
    }

    createLights() {
        // إضافة الإضاءة المحيطة
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);

        // إضافة الإضاءة الرئيسية
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        this.scene.add(mainLight);

        // إضافة أضواء النقاط للتأثيرات الدرامية
        const pointLight1 = new THREE.PointLight(0x3498db, 1, 50);
        pointLight1.position.set(-10, 5, -10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xe74c3c, 1, 50);
        pointLight2.position.set(10, -5, -10);
        this.scene.add(pointLight2);
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: CONFIG.COLORS.STARS,
            size: 0.1,
            transparent: true
        });

        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        this.starfield = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.starfield);
    }

    createShip() {
        this.ship = new Spaceship();
        this.scene.add(this.ship.model);
        
        // إضافة تأثير محرك السفينة
        this.engineParticles = new THREE.Points(
            new THREE.BufferGeometry(),
            new THREE.PointsMaterial({
                color: CONFIG.COLORS.SHIP.ENGINE,
                size: 0.05,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            })
        );
        this.scene.add(this.engineParticles);
    }

    spawnObject() {
        if (Math.random() < CONFIG.SPAWN_RATE) {
            const type = Math.random() < CONFIG.CRYSTAL_CHANCE ? "crystal" : "waste";
            const object = new SpaceObject(type);
            this.scene.add(object.model);
            this.spaceObjects.push(object);
        }
    }

    updateEngineParticles() {
        const positions = [];
        for (let i = 0; i < 50; i++) {
            const spread = 0.1;
            positions.push(
                this.ship.position.x + (Math.random() - 0.5) * spread,
                this.ship.position.y + (Math.random() - 0.5) * spread,
                this.ship.position.z - 0.5 - Math.random()
            );
        }
        this.engineParticles.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );
    }

    createExplosion(position, color) {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(position.x, position.y, position.z);
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
            );
            velocities.push(velocity);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        const particles = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                color: color,
                size: 0.1,
                transparent: true,
                opacity: 1,
                blending: THREE.AdditiveBlending
            })
        );

        this.scene.add(particles);

        // حركة الانفجار
        const animate = () => {
            const positions = particles.geometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                const idx = i * 3;
                positions[idx] += velocities[i].x;
                positions[idx + 1] += velocities[i].y;
                positions[idx + 2] += velocities[i].z;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            particles.material.opacity -= 0.02;

            if (particles.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(particles);
            }
        };

        animate();
    }

    handleCollisions() {
        for (let i = this.spaceObjects.length - 1; i >= 0; i--) {
            const object = this.spaceObjects[i];
            if (object.checkCollision(this.ship)) {
                if (object.type === "crystal") {
                    this.ship.addScore(CONFIG.CRYSTAL_SCORE);
                    this.ship.addEnergy(CONFIG.CRYSTAL_ENERGY);
                    this.createExplosion(object.position, CONFIG.COLORS.CRYSTAL.GLOW);
                } else {
                    const isDead = this.ship.takeDamage(CONFIG.WASTE_DAMAGE);
                    this.createExplosion(object.position, CONFIG.COLORS.WASTE);
                    if (isDead) this.endGame();
                }
                this.scene.remove(object.model);
                this.spaceObjects.splice(i, 1);
            } else if (!object.active) {
                this.scene.remove(object.model);
                this.spaceObjects.splice(i, 1);
            }
        }
    }

    setupEventListeners() {
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
        
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    handleKeyDown(event) {
        if (!this.gameStarted) return;
        
        const direction = { x: 0, y: 0 };
        
        switch (event.key) {
            case 'ArrowLeft':
                direction.x = -1;
                break;
            case 'ArrowRight':
                direction.x = 1;
                break;
            case 'ArrowUp':
                direction.y = 1;
                break;
            case 'ArrowDown':
                direction.y = -1;
                break;
        }
        
        this.ship.move(direction);
    }

    handleKeyUp(event) {
        if (!this.gameStarted) return;
        
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
                this.ship.move({ x: 0, y: 0 });
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                this.ship.move({ x: 0, y: 0 });
                break;
        }
    }

    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        this.gameStarted = true;
        this.ship.reset();
    }

    endGame() {
        this.gameStarted = false;
        document.getElementById('final-score').textContent = this.ship.score;
        document.getElementById('game-over').classList.remove('hidden');
    }

    restartGame() {
        document.getElementById('game-over').classList.add('hidden');
        this.startGame();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.gameStarted) {
            // تحديث النجوم
            this.starfield.rotation.z += 0.0001;
            this.starfield.position.z += 0.01;
            if (this.starfield.position.z > 20) {
                this.starfield.position.z = -20;
            }

            // تحديث جزيئات المحرك
            this.updateEngineParticles();

            // تحديث الكائنات
            this.spawnObject();
            this.spaceObjects.forEach(object => object.update());
            
            // فحص التصادمات
            this.handleCollisions();

            // حركة الكاميرا السلسة
            const targetCameraX = this.ship.position.x * 0.3;
            const targetCameraY = this.ship.position.y * 0.2;
            this.camera.position.x += (targetCameraX - this.camera.position.x) * 0.05;
            this.camera.position.y += (targetCameraY - this.camera.position.y) * 0.05;
            this.camera.lookAt(0, 0, 0);
        }

        // تحديث العرض
        this.composer.render();
    }
}

// إنشاء اللعبة عند تحميل الصفحة
window.addEventListener('load', () => {
    // تحميل مكتبات الإضافية
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
        const effectsScript = document.createElement('script');
        effectsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js';
        effectsScript.onload = () => {
            const bloomScript = document.createElement('script');
            bloomScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js';
            bloomScript.onload = () => {
                new Game();
            };
            document.head.appendChild(bloomScript);
        };
        document.head.appendChild(effectsScript);
    };
    document.head.appendChild(script);
});
