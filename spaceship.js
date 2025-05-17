class Spaceship {
    constructor() {
        this.createModel();
        this.position = { x: 0, y: 0, z: 0 };
        this.speed = CONFIG.PLAYER_SPEED;
        this.energy = CONFIG.INITIAL_ENERGY;
        this.score = 0;
        this.rotation = 0;
    }

    createModel() {
        // إنشاء نموذج السفينة
        const geometry = new THREE.Group();

        // جسم السفينة
        const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.COLORS.SHIP.BODY,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI;
        geometry.add(body);

        // الأجنحة
        const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
        const wingMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.COLORS.SHIP.WINGS
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0.3;
        geometry.add(wings);

        // محرك السفينة
        const engineGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.3, 6);
        const engineMaterial = new THREE.MeshPhongMaterial({ 
            color: CONFIG.COLORS.SHIP.ENGINE,
            emissive: CONFIG.COLORS.SHIP.ENGINE,
            emissiveIntensity: 0.5
        });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.y = 0.7;
        geometry.add(engine);

        // إضافة تأثير التوهج
        const glow = new THREE.PointLight(CONFIG.COLORS.SHIP.ENGINE, 1, 2);
        glow.position.y = 0.7;
        geometry.add(glow);

        this.model = geometry;
    }

    move(direction) {
        // تحديث الموقع
        this.position.x += direction.x * this.speed;
        this.position.y += direction.y * this.speed;
        
        // تحديث زاوية الدوران
        if (direction.x !== 0) {
            this.rotation = direction.x * Math.PI / 8;
        } else {
            this.rotation = 0;
        }

        // تقييد الحركة ضمن الحدود
        this.position.x = Math.max(
            CONFIG.MOVEMENT_BOUNDS.x.min,
            Math.min(this.position.x, CONFIG.MOVEMENT_BOUNDS.x.max)
        );
        this.position.y = Math.max(
            CONFIG.MOVEMENT_BOUNDS.y.min,
            Math.min(this.position.y, CONFIG.MOVEMENT_BOUNDS.y.max)
        );

        // تحديث موقع النموذج
        this.model.position.set(this.position.x, this.position.y, this.position.z);
        this.model.rotation.z = this.rotation;
    }

    takeDamage(damage) {
        this.energy = Math.max(0, this.energy - damage);
        // تحديث شريط الطاقة في الواجهة
        document.querySelector('.energy-fill').style.width = `${this.energy}%`;
        return this.energy <= 0;
    }

    addEnergy(amount) {
        this.energy = Math.min(CONFIG.MAX_ENERGY, this.energy + amount);
        document.querySelector('.energy-fill').style.width = `${this.energy}%`;
    }

    addScore(points) {
        this.score += points;
        document.querySelector('#score span').textContent = this.score;
    }

    reset() {
        this.position = { x: 0, y: 0, z: 0 };
        this.energy = CONFIG.INITIAL_ENERGY;
        this.score = 0;
        this.rotation = 0;
        this.model.position.set(0, 0, 0);
        this.model.rotation.z = 0;
        document.querySelector('.energy-fill').style.width = '100%';
        document.querySelector('#score span').textContent = '0';
    }
} 