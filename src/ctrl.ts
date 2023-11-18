import Phaser from "phaser"; 

export class Keyboard{
    scene:Phaser.Scene;
    A: Phaser.Input.Keyboard.Key;
    W: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    Q: Phaser.Input.Keyboard.Key;
    cursorKeys:Phaser.Types.Input.Keyboard.CursorKeys;
    constructor(scene:Phaser.Scene){
        this.scene=scene;
        this.A=scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.W=scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.D=scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.S=scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.Q=scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.cursorKeys=scene.input.keyboard!.createCursorKeys();
    }
}
