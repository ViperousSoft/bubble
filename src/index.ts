/*import React from "react";
import ReactDOM from "react-dom/client";
import {Bubble,Terrain} from "./res";
const M:React.FC=()=>{
    return (
        <div>
            <div style={{zIndex:1}}>
                <Terrain p={0}/>
            </div>
            <div style={{zIndex:2}}>
                <Bubble p={0}/>
            </div>
        </div>
    );
};

const root=ReactDOM.createRoot(document.body);
root.render(<M/>);*/
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


