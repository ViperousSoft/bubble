import Phaser from "phaser";
import {Keyboard} from "./ctrl";
import {Bubble,Boy,Board,Terrain,BType,Pivot} from "./model";
import bub from "../assets/bubble.png";
import boy from "../assets/boy.png";
import girl from "../assets/girl.png";
import blk from "../assets/blocks.png";
import expl from "../assets/explosion.png";
import loon from "../assets/Laura Shigihara - Loonboon.mp3";
import explode from "../assets/explosion.wav";

/*export class Mgr{
    //static mgr:Mgr;
    scene:BaseScene;
    private _keyboard?:Keyboard;
    //private _boySprite?:Boy;
    //private _tiles?:Board;
    private _bgm?:Phaser.Sound.BaseSound;
    constructor(scene:BaseScene){
        this.scene=scene;
    }
    preload(){
        
        //this._tiles=this.scene.make.tilemap({key:"map"});
        //this._tiles.addTilesetImage("ground","block");
        //this._ground=this._tiles.createLayer("ground","ground")!.setCollisionByExclusion([0]);
    }
    create(){
        //this._tiles=this.scene.createBoard();
        //this._ground=this.tiles.map.createBlankLayer("ground","block",0,0,40,40);
        //this.ground.fill(0,0,0,40,40);
        
        //this.tiles.createLayer(0,"block")?.fill(0,0,0,40,40);
        //this._bgm=this.scene.sound.add("bgm");
        
        this._keyboard=new Keyboard(this.scene);
        //this._boySprite=new Boy(this.scene);
    }
    get keyboard(){
        return this._keyboard!;
    }
    get bgm(){
        return this._bgm!;
    }
}*/

export class BaseScene extends Phaser.Scene{
    board?:Board;
    keyboard?:Keyboard;
    constructor(){
        super("BaseScene");
        
        //this.mgr=new Mgr(this);
    }
    preload(){
        this.load.spritesheet("bub",bub,{frameWidth:46,frameHeight:46});
        this.load.spritesheet("boy",boy,{frameWidth:48,frameHeight:60});
        this.load.spritesheet("girl",girl,{frameWidth:48,frameHeight:60});
        this.load.spritesheet("block",blk,{frameWidth:40,frameHeight:40});
        this.load.spritesheet("expl",expl,{frameWidth:40,frameHeight:40});
        //this.load.image("expl",expl);
        this.load.audio("bgm",loon);
        this.load.audio("explode",explode);
        //this.mgr.preload();
    }
    create(){
        this.anims.create({
            key:"bubble",
            frames:this.anims.generateFrameNumbers("bub"),
            frameRate:6,
            repeat:-1
        });
        this.anims.create({
            key:`boy${Pivot.S}`,
            frames:this.anims.generateFrameNumbers("boy",{
                start:0,
                end:3
            }),
            frameRate:6,
            repeat:-1
        });
        this.anims.create({
            key:`boy${Pivot.W}`,
            frames:this.anims.generateFrameNumbers("boy",{
                start:4,
                end:7
            }),
            frameRate:6,
            repeat:-1
        });
        this.anims.create({
            key:`boy${Pivot.E}`,
            frames:this.anims.generateFrameNumbers("boy",{
                start:8,
                end:11
            }),
            frameRate:6,
            repeat:-1
        });
        this.anims.create({
            key:`boy${Pivot.N}`,
            frames:this.anims.generateFrameNumbers("boy",{
                start:12,
                end:15
            }),
            frameRate:6,
            repeat:-1
        });
        this.sound.add("bgm");
        this.sound.add("explode");
        this.keyboard=new Keyboard(this);
        //this.mgr.create();
    }
}

export class S extends BaseScene{
    boy?:Boy;
    create(){
        super.create();
        this.board=new Board(this,20,20);
        
        const l=this.board!.map.createBlankLayer("ground","block",0,0,20,20)!;
        l.fill(Terrain.EMPTY,0,0,20,20);
        l.fill(Terrain.TREE,0,0,20,1);
        l.fill(Terrain.TREE,0,19,20,1);
        l.fill(Terrain.TREE,0,0,1,20);
        l.fill(Terrain.TREE,19,0,1,20);
        for(let i=0;i<30;i++){
            l.fill(Terrain.CACTUS,Math.floor(Math.random()*18)+1,Math.floor(Math.random()*18)+1,1,1)
        }
        l.setCollisionByExclusion([Terrain.EMPTY]);

        this.boy=new Boy(this);
        
        //new Bubble(this,0).start(3000);
        this.boy.setPosition({x:200,y:200});
        this.boy.activate();
        this.boy.sprite.body.setSize(10,10,false);
        this.boy.sprite.body.setOffset(19,45);
        //this.boy.sprite.setOrigin(0.1,0.3);
        
        //this.boy.sprite.body.setOffset(this.boy.sprite.originX)
        //this.boy.sprite.body.setOffset(0,0);
        this.physics.add.collider(this.boy.sprite,l);
        this.sound.play("bgm",{loop:true});
    }
    update(time: number, delta: number){
        if(this.keyboard!.A.isDown){
            this.boy!.start(Pivot.W);
        }
        else if(this.keyboard!.D.isDown){
            this.boy!.start(Pivot.E);
        }
        else if(this.keyboard!.W.isDown){
            this.boy!.start(Pivot.N);
        }
        else if(this.keyboard!.S.isDown){
            this.boy!.start(Pivot.S);
        }
        else{
            this.boy!.stop();
        }
        if(this.keyboard!.Q.isDown){
            this.boy!.bubble(BType.BLUE);
        }
    }
}