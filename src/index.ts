import Phaser from "phaser";
import {start} from "./scene";

start(new Phaser.Game({
    physics:{
        default:"arcade",
        arcade:{
            debug:false,
        }
    },
    scale:{
        mode:Phaser.Scale.NONE
    }
}));
