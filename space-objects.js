class SpaceObject {
    constructor(type = "waste") {
        this.type = type;
        this.createModel();
        this.position = {
            x: Math.random() * (CONFIG.MOVEMENT_BOUNDS.x.max - CONFIG.MOVEMENT_BOUNDS.x.min) + CONFIG.MOVEMENT_BOUNDS.x.min,
            y: Math.random() * (CONFIG.MOVEMENT_BOUNDS.y.max - CONFIG.MOVEMENT_BOUNDS.y.min) + CONFIG.MOVEMENT_BOUNDS.y.min,
            z: CONFIG.MOVEMENT_BOUNDS.z.min
        };
        this.speed = CONFIG.OBJECT_SPEED;
        this.active = true;
        this.rotation = {
            x: Math.random() * Math.PI,
            y: Math.random() * Math.PI,
            z: Math.random() * Math.PI
        };
        this.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        };
    }

    createModel() {
        if (this.type === "waste") {
            this.createWasteModel();
        } else {
            this.createCrystalModel();
        }
    }

    createWasteModel() {
        // إنشاء نموذج النفايات
        const geometry = new THREE.Group();

        // إنشاء أشكال عشوائية للنفايات
        for (let i = 0; i < 5; i++) {
            const size = 0.2 + Math.random() * 0.3;
            const boxGeometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshPhongMaterial({
                color: CONFIG.COLORS.WASTE,
                roughness: 0.7,
                metalness: 0.3
            });
            const box = new THREE.Mesh(boxGeometry, material);
            
            // وضع الأشكال بشكل عشوائي حول المركز
            box.position.set(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            box.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            geometry.add(box);
        }

        this.model = geometry;
    }

    createCrystalModel() {
        const geometry = new THREE.Group();

        // البلورة الرئيسية
        const crystalGeometry = new THREE.OctahedronGeometry(0.5);
        const crystalMaterial = new THREE.MeshPhongMaterial({
            color: CONFIG.COLORS.CRYSTAL.BASE,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        geometry.add(crystal);

        // إضافة توهج داخلي
        const glowGeometry = new THREE.OctahedronGeometry(0.6);
        const glowMaterial = new THREE.MeshPhongMaterial({
            color: CONFIG.COLORS.CRYSTAL.GLOW,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        geometry.add(glow);

        // إضافة نقطة ضوء
        const light = new THREE.PointLight(CONFIG.COLORS.CRYSTAL.GLOW, 1, 3);
        geometry.add(light);

        this.model = geometry;
    }

    update() {
        // تحريك الكائن للأمام
        this.position.z += this.speed;
        
        // تدوير الكائن
        this.rotation.x += this.rotationSpeed.x;
        this.rotation.y += this.rotationSpeed.y;
        this.rotation.z += this.rotationSpeed.z;

        // تحديث موقع ودوران النموذج
        this.model.position.set(this.position.x, this.position.y, this.position.z);
        this.model.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);

        // التحقق من خروج الكائن من حدود اللعبة
        if (this.position.z > CONFIG.MOVEMENT_BOUNDS.z.max) {
            this.active = false;
        }
    }

    checkCollision(ship) {
        const distance = Math.sqrt(
            Math.pow(this.position.x - ship.position.x, 2) +
            Math.pow(this.position.y - ship.position.y, 2) +
            Math.pow(this.position.z - ship.position.z, 2)
        );
        return distance < 1;
    }
} 