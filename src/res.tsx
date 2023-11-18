import React from "react";
import b from "../assets/bubble.bmp";
import t from "../assets/blocks.bmp";
import "./style.css";
export const Bubble:React.FC<{p:number}>=(props)=>{
    return (
        <div className="bub">
            <img className="bub" src={b} onDragStart={(e)=>{e.preventDefault()}}></img>
        </div>
    );
};
export const Terrain:React.FC<{p:number}>=(props)=>{
    props.p*=40;
    //return <div><img src={b} style={{clipPath:`polygon(${props.p}px 0, ${props.p+46}px 0, ${props.p+46}px 100%, ${props.p}px 100%)`,filter:"hue-rotate(180deg)",userSelect:"none",objectPosition:"left top",position:"absolute"}}></img></div>;
    return (
        <div className="ter">
            <img src={t} style={{margin:`0 0 0 -${props.p}px`,padding:0}} onDragStart={(e)=>{e.preventDefault()}}></img>
        </div>
    );
};
