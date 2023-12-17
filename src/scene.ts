import Phaser from "phaser";
import EventEmitter,{ValidEventTypes} from "eventemitter3";

import {BubbleType,Pivot,Env,BoxEnv} from "./model";
import {Bar,Button} from "./ui";
import {SceneUtils} from "./utils";
import {Keyboard} from "./ctrl";

import bub from "../assets/bubble.png";
import boy from "../assets/boy.png";
import girl from "../assets/girl.png";
import blk from "../assets/blocks.png";
import expl from "../assets/explosion.png";
import box from "../assets/boxes.png";
import loon from "../assets/Laura Shigihara - Loonboon.mp3";
import explode from "../assets/explosion.wav";
import grass from "../assets/Grass.png";
import helpText from "./help.txt";



export enum SpriteKey{
    GRASS="grass",
    BLK="blk",
    BOX="box",
    EXPL="expl",
    BUB="bub"
}

export enum AudioKey{
    LOON="bgm",
    EXPLO="explode"
}

export enum PlayerKey{
    BOY="boy",
    BLUEBOY="blueboy",
    GIRL="girl",
    BLUEGIRL="bluegirl"
}

export abstract class SysScene<T extends ValidEventTypes={}> extends Phaser.Scene{
    myEvents:EventEmitter<T>;
    constructor(c?:string){
        super(c);
        this.myEvents=new EventEmitter();
    }
    activate(){
        SceneUtils.launch(this);
        this.scene.setVisible(true);
        this.scene.bringToTop(this);
    }
    deactivate(){
        SceneUtils.shutdown(this);
        this.scene.setVisible(false);
        this.scene.sendToBack(this);
    }
}

class GameOver extends SysScene<{
    main:[]
}>{
    score!:number;
    init(){
        const w=400,h=450;
        const x=(this.game.canvas.width-w)/2,y=(this.game.canvas.height-h)/2;
        this.cameras.main.setViewport(x,y,w,h);
        this.cameras.main.setBackgroundColor("rgba(255,0,0,0.5)");
    }
    create(){
        this.add.text(200,100,"GAME OVER").setOrigin(0.5,0.5).setFontSize(30);
        this.add.text(200,200,`Score: ${this.score}`).setOrigin(0.5,0.5);
        const b=new Button(this,()=>{
            this.myEvents.emit("main");
        });
        b.defaults();
        b.setText("Main Menu");
        b.setPosition(100,250);
        b.setSize(200,100);
        b.setDepth(1);
        b.activate();
    }
}

export class Start extends SysScene<{
    box:[],
    pvp:[],
    help:[]
}>{

    init(){
        this.scale.resize(800,800);
    }
    preload(){
        
        const b=new Bar(this);
        const w=200,h=20;
        const x=(this.game.canvas.width-w)/2,y=(this.game.canvas.height-h)/2;
        b.setColor(0xffffff);
        b.setSize(w,h);
        b.setPosition(x,y);
        b.setLineWidth(5);
        b.activate();
        
        this.load.on("progress",(v:number)=>{
            b.setCur(v);
        });
        this.load.on("complete",()=>{
            b.destroy();
        });

        this.load.spritesheet(SpriteKey.BUB,bub,{frameWidth:46,frameHeight:46});
        this.load.spritesheet(PlayerKey.BOY,boy,{frameWidth:48,frameHeight:60});
        this.load.spritesheet(PlayerKey.GIRL,girl,{frameWidth:48,frameHeight:60});
        this.load.spritesheet(SpriteKey.BLK,blk,{frameWidth:40,frameHeight:40});
        this.load.spritesheet(SpriteKey.EXPL,expl,{frameWidth:40,frameHeight:40});
        this.load.spritesheet(SpriteKey.BOX,box,{frameWidth:40,frameHeight:40});
        this.load.audio(AudioKey.LOON,loon);
        this.load.audio(AudioKey.EXPLO,explode);
        this.load.spritesheet(SpriteKey.GRASS,grass,{frameWidth:384,frameHeight:64});
        
    }
    create(){
        const bs=[BubbleType.BLUE,BubbleType.RED,BubbleType.BLACK,BubbleType.GREEN,BubbleType.PURPLE];
        for(let i=0;i<bs.length;i++){
            this.anims.create({
                key:`${SpriteKey.BUB}${bs[i]}`,
                frames:this.anims.generateFrameNumbers(SpriteKey.BUB,{
                    start:i*6,
                    end:i*6+5
                }),
                frameRate:6,
                repeat:-1
            });
        }
        const p=[Pivot.S,Pivot.W,Pivot.E,Pivot.N];
        for(let i=0;i<p.length;i++){
            this.anims.create({
                key:`${PlayerKey.BOY}${p[i]}`,
                frames:this.anims.generateFrameNumbers(PlayerKey.BOY,{
                    start:i*4,
                    end:i*4+3
                }),
                frameRate:6,
                repeat:-1
            });
        }
        this.sound.add(AudioKey.LOON);
        this.sound.add(AudioKey.EXPLO);

        this.add.tileSprite(0,0,800,800,SpriteKey.GRASS,0).setOrigin(0,0);
        this.add.text(400,200,"Bubble").setOrigin(0.5,0.5).setFontSize(40).setColor("#ff0000");
        const b=new Button(this,()=>{
            this.myEvents.emit("box");
        });
        b.defaults();
        b.setText("Box");
        b.setPosition(300,350);
        b.setSize(200,100);
        //b.setDepth(1);
        b.activate();
        
        const b1=new Button(this,()=>{
            this.myEvents.emit("help");
        });
        b1.defaults();
        b1.setText("Help");
        b1.setPosition(300,450);
        b1.setSize(200,100);
        b1.activate();
        
    }
    
}

export class Pause extends SysScene<{
    resume:[],
    restart:[],
    main:[],
}>{
    init(){
        this.cameras.main.setBackgroundColor("rgba(20,20,20,0.7)");
        //this.deactivate();
    }
    create(){
        this.add.text(200,100,"PAUSED").setOrigin(0.5,0.5).setFontSize(30);
        const b=new Button(this,()=>{
            this.myEvents.emit("resume");
        });
        b.defaults();
        b.setText("Resume");
        b.setPosition(150,200);
        b.setSize(100,50);
        b.setDepth(1);
        b.activate();

        const b2=new Button(this,()=>{
            this.myEvents.emit("main");
        });
        b2.defaults();
        b2.setText("Main Menu");
        b2.setPosition(150,300);
        b2.setSize(100,50);
        b2.setDepth(1);
        b2.activate();
    }
    show(){
        const w=400,h=400;
        this.activate();
        const x=(this.scale.gameSize.width-w)/2,y=(this.scale.gameSize.height-h)/2;
        this.cameras.main.setViewport(x,y,w,h);
    }
    
}

class Help extends SysScene<{
    main:[]
}>{
    create(){
        this.add.tileSprite(0,0,800,800,SpriteKey.GRASS).setOrigin(0,0);
        const r=this.add.rectangle(100,100,600,400).setOrigin(0,0).setStrokeStyle(2,0x888888).setInteractive();
        
        this.add.text(400,50,"HELP").setOrigin(0.5,0.5).setFontSize(30);
        const t1=this.add.text(400,100,helpText).setOrigin(0.5,0).setFontSize(20).setCrop(0,0,600,400);
        t1.setWordWrapWidth(600);
        
        r.on("wheel",(pointer:Phaser.Input.Pointer,dx:number,dy:number,dz:number)=>{
            t1.setPosition(t1.x,Phaser.Math.Clamp(t1.y-dy,500-t1.height,100));
            t1.setCrop(0,100-t1.y,600,400);
        });

        const b=new Button(this,()=>{
            this.myEvents.emit("main");
        });
        b.defaults();
        b.setText("Main Menu");
        b.setPosition(300,600);
        b.setSize(200,100);
        b.activate();
    }
}

export class Choose extends SysScene<{
    done:[PlayerKey]
}>{
    static keys=[PlayerKey.BOY,PlayerKey.GIRL,PlayerKey.BLUEBOY,PlayerKey.BLUEGIRL];
    i:number;
    sprite!:Phaser.GameObjects.Sprite;
    keyboard!:Keyboard;
    constructor(c?:string){
        super(c);
        this.i=0;
    }
    create(){
        this.add.tileSprite(0,0,800,800,SpriteKey.GRASS,1).setOrigin(0,0);
        this.sprite=this.add.sprite(400,400,PlayerKey.BOY,0);
        this.keyboard=new Keyboard(this);
    }
    update(time:number,delta:number){
        if(this.keyboard.E.isDown){
            this.i=(this.i+1)%Choose.keys.length;
        }
        else if(this.keyboard.Q.isDown){
            this.i=(this.i-1+Choose.keys.length)%Choose.keys.length;
        }
        this.sprite.setTexture(Choose.keys[this.i],0);
    }
}


function isKey<T extends object>(k:PropertyKey,t:T):k is keyof T{
    return k in t;
}



export class EnvScene extends Phaser.Scene{
    myEvents:EventEmitter<{
        init:[],
        preload:[],
        create:[],
        update:[number,number]
    }>;
    constructor(c?:string){
        super(c);
        this.myEvents=new EventEmitter();
    }
    protected init(){
        this.myEvents.emit("init");
        this.events.once("shutdown",()=>{
            this.myEvents.removeAllListeners();
        });
    }
    protected preload(){
        this.myEvents.emit("preload");
    }
    protected create(){
        this.myEvents.emit("create");
    }
    update(time:number,delta:number){
        this.myEvents.emit("update",time,delta);
    }
}

export class Mgr{
    start:Start;
    pause:Pause;
    help:Help;
    gameover:GameOver;
    env!:Env<any>;
    game:Phaser.Game;
    constructor(){
        
        this.start=new Start("start");
        this.pause=new Pause("pause");
        this.help=new Help("help");
        this.gameover=new GameOver("gameover");
        
        this.start.myEvents.on("box",()=>{
            const main=new EnvScene("main");
            this.game.scene.add("main",main,true);
            const s=new EnvScene("s");
            this.game.scene.add("s",s,true);
            this.env=new BoxEnv(main,s);
        });
        this.pause.myEvents.on("main",()=>{
            this.env.done();
            this.start.activate();
            this.pause.deactivate();
        });
        this.pause.myEvents.on("resume",()=>{
            this.env.resume();
            this.pause.deactivate();
        });
        this.help.myEvents.on("main",()=>{
            this.start.activate();
            this.help.deactivate();
        });
        
        this.game=new Phaser.Game({
            type:Phaser.AUTO,
            width:800,
            height:800,
            scene:[this.start,this.pause,this.help,this.gameover],
            physics:{
                default:"arcade",
                arcade:{
                    debug:false
                }
            }
        })
    }
}
