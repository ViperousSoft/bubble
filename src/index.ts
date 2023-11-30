import Phaser from "phaser";
import {Start} from "./scene";

new Phaser.Game({
    width:800,
    height:800,
    scene:new Start("start"),
    physics:{
        default:"arcade",
        arcade:{
            debug:false,
        }
    },
    scale:{
        mode:Phaser.Scale.NONE
    }
});
