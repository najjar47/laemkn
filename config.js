const CONFIG = {
    // إعدادات اللعبة
    PLAYER_SPEED: 0.1,
    OBJECT_SPEED: 0.1,
    SPAWN_RATE: 0.02,
    CRYSTAL_CHANCE: 0.3,
    
    // حدود الحركة
    MOVEMENT_BOUNDS: {
        x: { min: -5, max: 5 },
        y: { min: -3, max: 3 },
        z: { min: -15, max: 5 }
    },
    
    // نقاط وطاقة
    CRYSTAL_SCORE: 100,
    CRYSTAL_ENERGY: 20,
    WASTE_DAMAGE: 10,
    INITIAL_ENERGY: 100,
    MAX_ENERGY: 100,
    
    // ألوان
    COLORS: {
        SHIP: {
            BODY: 0x4a90e2,
            WINGS: 0x2c3e50,
            ENGINE: 0xe67e22
        },
        CRYSTAL: {
            BASE: 0x2ecc71,
            GLOW: 0x27ae60
        },
        WASTE: 0xe74c3c,
        STARS: 0xffffff
    }
}; 