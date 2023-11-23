import Phaser from "phaser";
import {S} from "./scene";

const game=new Phaser.Game({
    width:800,
    height:800,
    scene:new S(),
    physics:{
        default:"arcade",
        arcade:{
            debug:false,
        }
    }
});
