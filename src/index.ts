import Phaser from "phaser";
import {S,Start} from "./scene";

const game=new Phaser.Game({
    width:800,
    height:800,
    scene:[new Start(),new S("S")],
    physics:{
        default:"arcade",
        arcade:{
            debug:false,
        }
    }
});
