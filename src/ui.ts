import Phaser from "phaser";
import {EnvScene} from "./scene";

export abstract class UI{
    scene:Phaser.Scene;
    constructor(scene:Phaser.Scene){
        this.scene=scene;
    }
    abstract setPosition(x:number,y:number):void;
    abstract setSize(w:number,h:number):void;
    abstract setDepth(v:number):void;
    abstract activate():void;
    abstract deactivate():void;
}

export class Bar extends UI{
    border:Phaser.GameObjects.Rectangle;
    fill:Phaser.GameObjects.Rectangle;
    max:number;
    cur:number;
    constructor(scene:Phaser.Scene){
        super(scene);
        this.border=scene.add.rectangle().setScrollFactor(0).setOrigin(0,0);
        this.fill=scene.add.rectangle().setScrollFactor(0).setOrigin(0,0);
        this.deactivate();
        this.max=1;
        this.cur=0;
        this.setDepth(0);
    }
    setPosition(x:number,y:number){
        this.border.setPosition(x,y);
        this.fill.setPosition(x,y);
    }
    setSize(w:number,h:number){
        this.border.setSize(w,h);
        this.fill.setSize(w,h);
        this.upd();
    }
    setColor(c:number){
        this.border.setStrokeStyle(this.border.lineWidth,c);
        this.fill.setFillStyle(c);
    }
    setBackColor(c?:number,a?:number){
        this.border.setFillStyle(c,a);
    }
    setLineWidth(w:number){
        this.border.setStrokeStyle(w,this.border.strokeColor);
    }
    setDepth(v:number){
        this.border.setDepth(v);
        this.fill.setDepth(v+1);
    }
    activate(){
        this.border.setActive(true).setVisible(true);
        this.fill.setActive(true).setVisible(true);
    }
    deactivate(){
        this.border.setActive(false).setVisible(false);
        this.fill.setActive(false).setVisible(false);
    }
    setMax(m:number){
        this.max=m;
        this.upd();
    }
    setCur(c:number){
        this.cur=c;
        this.upd();
    }
    destroy(){
        this.border.destroy();
        this.fill.destroy();
    }
    private upd(){
        this.fill.setSize(Math.round(this.border.width*this.cur/this.max),this.border.height);
    }
}

export class Plate extends UI{
    border:Phaser.GameObjects.Arc;
    fill:Phaser.GameObjects.Arc;
    max:number;
    cur:number;
    constructor(scene:Phaser.Scene){
        super(scene);
        this.border=scene.add.arc().setScrollFactor(0);
        this.fill=scene.add.arc().setScrollFactor(0);
        this.deactivate();
        this.max=1;
        this.cur=0;
        this.setDepth(0);
    }
    setPosition(x:number,y:number){
        this.border.setPosition(x,y);
        this.fill.setPosition(x,y);
    }
    setSize(r:number){
        this.border.setRadius(r);
        this.fill.setRadius(r);
        this.upd();
    }
    setColor(c:number){
        this.border.setStrokeStyle(this.border.lineWidth,c);
        this.fill.setFillStyle(c);
    }
    setBackColor(c?:number,a?:number){
        this.border.setFillStyle(c,a);
    }
    setLineWidth(w:number){
        this.border.setStrokeStyle(w,this.border.strokeColor);
    }
    setDepth(v:number){
        this.border.setDepth(v);
        this.fill.setDepth(v+1);
    }
    activate(){
        this.border.setActive(true).setVisible(true);
        this.fill.setActive(true).setVisible(true);
    }
    deactivate(){
        this.border.setActive(false).setVisible(false);
        this.fill.setActive(false).setVisible(false);
    }
    setMax(m:number){
        this.max=m;
        this.upd();
    }
    setCur(c:number){
        this.cur=c;
        this.upd();
    }
    destroy(){
        this.border.destroy();
        this.fill.destroy();
    }
    private upd(){
        const t=360*this.cur/this.max;
        this.fill.setStartAngle(t*2);
        this.fill.setEndAngle(t*3);
    }
}

export class Button extends UI{
    text:Phaser.GameObjects.Text;
    rect:Phaser.GameObjects.Rectangle;
    overBack:number;
    overText:string;
    outBack:number;
    outText:string;
    constructor(scene:Phaser.Scene,onClick:()=>void){
        super(scene);
        this.overBack=0x888888;
        this.overText="#ffffff";
        this.outBack=0x555555;
        this.outText="#ffffff";
        this.text=scene.add.text(0,0,"").setOrigin(0.5,0.5).setScrollFactor(0);
        this.rect=scene.add.rectangle().setOrigin(0,0).setScrollFactor(0);
        this.setDepth(0);

        this.rect.on("pointerdown",onClick);
        this.rect.on("pointerover",()=>{
            this.rect.setFillStyle(this.overBack);
            this.text.setColor(this.overText);
        });
        this.rect.on("pointerout",()=>{
            this.rect.setFillStyle(this.outBack);
            this.text.setColor(this.outText);
        });
        this.deactivate();
    }
    setPosition(x:number,y:number){
        this.rect.setPosition(x,y);
        this.text.setPosition(x+this.rect.width/2,y+this.rect.height/2);
        this.rect.setInteractive();
    }
    setSize(w:number,h:number){
        this.rect.setSize(w,h);
        this.text.setPosition(this.rect.x+this.rect.width/2,this.rect.y+this.rect.height/2);
        this.rect.setInteractive();
    }
    setText(t:string){
        this.text.setText(t);
    }
    setDepth(v:number){
        this.rect.setDepth(v);
        this.text.setDepth(v+1);
    }
    
    activate(){
        this.rect.emit("pointerout");
        this.rect.setActive(true).setVisible(true);
        this.text.setActive(true).setVisible(true);
    }
    deactivate(){
        this.rect.setActive(false).setVisible(false);
        this.text.setActive(false).setVisible(false);
    }
    defaults(){
        this.outBack=0xff0000;
        this.outText="#ffffff";
        this.overBack=0x00ff00;
        this.overText="#000000";
    }
}
