import Phaser from "phaser"; 

const validKeyCodes=[
"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
"ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
"UP", "DOWN", "LEFT", "RIGHT", "ENTER"] as const;
export type ValidKeyCodes=(typeof validKeyCodes)[number];

export class Keyboard{
    static getKeyboardKeys(scene:Phaser.Scene){
        const keyboardKeys={} as Record<ValidKeyCodes,Phaser.Input.Keyboard.Key>;
        validKeyCodes.forEach(keyCode=>{
            const key=Phaser.Input.Keyboard.KeyCodes[keyCode];
            keyboardKeys[keyCode]=scene.input.keyboard!.addKey(key);
        });
        return keyboardKeys;
    }
}
