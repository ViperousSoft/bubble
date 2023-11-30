import Phaser from "phaser";
import {Keyboard} from "./ctrl";
import {Bubble,Boy,Board,Terrain,BType,Pivot,BoxType,EType,Explosion,Bar,Button} from "./model";
import {iterateX,iterateO,iterateH} from "./utils";
import bub from "../assets/bubble.png";
import boy from "../assets/boy.png";
import girl from "../assets/girl.png";
import blk from "../assets/blocks.png";
import expl from "../assets/explosion.png";
import box from "../assets/boxes.png";
import loon from "../assets/Laura Shigihara - Loonboon.mp3";
import explode from "../assets/explosion.wav";
import grass from "../assets/Grass.bmp";


export abstract class BaseScene extends Phaser.Scene{
    board?:Board;
    keyboard?:Keyboard;
    egroup?:Phaser.Physics.Arcade.Group;
    start:Start;
    constructor(s:Start,c?:string){
        super(c);
        this.start=s;
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
        this.load.spritesheet("bub",bub,{frameWidth:46,frameHeight:46});
        this.load.spritesheet("boy",boy,{frameWidth:48,frameHeight:60});
        this.load.spritesheet("girl",girl,{frameWidth:48,frameHeight:60});
        this.load.spritesheet("block",blk,{frameWidth:40,frameHeight:40});
        this.load.spritesheet("expl",expl,{frameWidth:40,frameHeight:40});
        this.load.spritesheet("box",box,{frameWidth:40,frameHeight:40});
        this.load.audio("bgm",loon);
        this.load.audio("explode",explode);
    }
    create(){
        this.anims.create({
            key:`bubble${BType.BLUE}`,
            frames:this.anims.generateFrameNumbers("bub",{
                start:0,
                end:5
            }),
            frameRate:6,
            repeat:-1
        });
        this.anims.create({
            key:`bubble${BType.RED}`,
            frames:this.anims.generateFrameNumbers("bub",{
                start:6,
                end:11
            }),
            frameRate:6,
            repeat:-1
        });
        this.anims.create({
            key:`bubble${BType.BLACK}`,
            frames:this.anims.generateFrameNumbers("bub",{
                start:12,
                end:17
            }),
            frameRate:6,
            repeat:-1
        });
        this.anims.create({
            key:`bubble${BType.GREEN}`,
            frames:this.anims.generateFrameNumbers("bub",{
                start:18,
                end:23
            }),
            frameRate:6,
            repeat:-1
        });
        this.anims.create({
            key:`bubble${BType.PURPLE}`,
            frames:this.anims.generateFrameNumbers("bub",{
                start:24,
                end:29
            }),
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
        this.egroup=this.physics.add.group();
    }
    abstract pop(b:Bubble):void;
}

export class SBoard extends Phaser.Scene{
    b!:Bar;
    max:number;
    constructor(m:number,c?:string){
        super(c);
        this.max=m;
    }
    preload(){
        this.load.image("grass",grass);
    }
    create(){
        this.add.tileSprite(0,0,200,600,"grass").setOrigin(0,0);
        const t=this.add.text(100,100,"0").setOrigin(0.5,0.5).setColor("#fff000").setFontSize(20);
        this.b=new Bar(this);
        
        this.b.setColor(0xffffff);
        this.b.setPosition(50,200);
        this.b.setMax(this.max);
        this.b.setLineWidth(2);
        this.b.setSize(100,20);
        this.b.activate();
        this.events.on("score",(v:number)=>{
            t.setText(v.toString());
        });
        this.events.on("time",(v:number)=>{
            this.b.setCur(v);
        });
        
        const b=new Button(this,()=>{
            this.events.emit("p");
        });
        b.outBack=0xff0000;
        b.outText="#ffffff";
        b.overBack=0x00ff00;
        b.overText="#000000";
        b.setText("Pause");
        b.setPosition(50,300);
        b.setSize(100,50);
        //b.setDepth(1);
        b.activate();
        
    }
}

class SGO extends Phaser.Scene{
    score!:number;
    //onMenu:()=>void;
    start:Start;
    constructor(n:number,s:Start,c?:string){
        super(c);
        this.score=n;
        this.start=s;
    }
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
            this.scene.wake(this.start);
            this.start.clear();
            this.scene.stop(this).remove(this);
        });
        b.outBack=0xff0000;
        b.outText="#ffffff";
        b.overBack=0x00ff00;
        b.overText="#000000";
        b.setText("Main Menu");
        b.setPosition(100,250);
        b.setSize(200,100);
        b.setDepth(1);
        b.activate();
    }
}

export class S extends BaseScene{
    boy?:Boy;
    score!:number;
    tim!:number;
    //text!:Phaser.GameObjects.Text;
    //t!:Bar;
    s!:SBoard;
    init(){
        this.scale.resize(800,600);
    }
    create(){
        super.create();
        const w=20,h=20;
        this.board=new Board(this,w,h);
        this.tim=180000;
        this.s=new SBoard(this.tim,"s");
        this.scene.add("s",this.s,true);
        
        this.start.main.push(this,this.s);
        this.s.events.on("p",()=>{
            this.scene.wake("pause");
            this.scene.bringToTop("pause");
            this.start.pause();
            //console.log("fdfdfs");
        });

        const l=this.board!.map.createBlankLayer("ground","block",0,0,w,h)!;
        l.fill(Terrain.EMPTY,0,0,w,h);
        l.fill(Terrain.TREE,0,0,w,1);
        l.fill(Terrain.TREE,0,h-1,w,1);
        l.fill(Terrain.TREE,0,0,1,h);
        l.fill(Terrain.TREE,w-1,0,1,h);
        for(let i=0;i<100;i++){
            l.putTileAt(Terrain.CACTUS,Math.floor(Math.random()*(w-2))+1,Math.floor(Math.random()*(h-2))+1);
        }
        l.setCollisionBetween(1,100);

        const s=this.board!.map.createBlankLayer("box","box",0,0,w,h)!;
        for(let i=0;i<w;i++){
            for(let j=0;j<h;j++){
                if(l.getTileAt(i,j).index==Terrain.EMPTY&&Math.random()<0.5){
                    if(Math.random()<0.1){
                        s.putTileAt(BoxType.DARK,i,j);
                    }
                    else if(Math.random()<0.1){
                        s.putTileAt(BoxType.BLUE,i,j);
                        
                    }
                    else if(Math.random()<0.1){
                        s.putTileAt(BoxType.PURPLE,i,j);
                        
                    }
                    else if(Math.random()<0.1){
                        s.putTileAt(BoxType.BLACK,i,j);
                        
                    }
                    else{
                        s.putTileAt(BoxType.SILVER,i,j);
                    }
                }

            }
        }
        s.setCollisionBetween(0,100);

        this.boy=new Boy(this);
        
        this.score=0;
        
        this.boy.setUnit({x:10,y:10});
        this.boy.activate();
        this.boy.sprite.body.setSize(10,10,false);
        this.boy.sprite.body.setOffset(19,45);
        this.physics.add.collider(this.boy.sprite,l);
        this.physics.add.collider(this.boy.sprite,s);

        this.cameras.main.setViewport(0,0,600,600);
        this.s.cameras.main.setViewport(600,0,200,600);
        this.cameras.main.startFollow(this.boy.sprite).setBounds(0,0,this.board.map.widthInPixels,this.board.map.heightInPixels);
        this.sound.play("bgm",{loop:true});
    }
    update(time: number, delta: number){
        this.tim=Math.max(0,this.tim-delta);
        this.s.events.emit("time",this.tim);
        if(this.tim==0){
            const p=new SGO(this.score,this.start);
            this.start.pause();
            this.scene.add("go",p,true);
            return;
        }
        const bo=this.board!.map.getLayer("box")!.tilemapLayer;
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
        if(this.keyboard!.E.isDown){
            this.boy!.bubble(BType.RED);
        }
        this.physics.overlap(this.boy!.sprite,this.egroup!,(a,b)=>{
            if(this.boy!.no)return;
            a=a as Phaser.Types.Physics.Arcade.GameObjectWithBody;
            b=b as Phaser.Types.Physics.Arcade.GameObjectWithBody;
            this.boy!.setNo(true);
            this.time.addEvent({
                delay:1000,
                callback:()=>{
                    this.boy!.setNo(false);
                }
            });
            //console.log(b.state);
            switch(b.state){
            case EType.O:
                this.upd(-1);
                break;
            case EType.RED:
                this.upd(-2);
                break;
            case EType.BLACK:
                this.upd(-3);
                break;
            default:break;
            }
        });
        this.physics.overlap(bo,this.egroup!,(b,a)=>{
            a=a as Phaser.Tilemaps.Tile;
            b=b as Phaser.Types.Physics.Arcade.GameObjectWithBody;
            
            switch(a.index){
            case BoxType.O:
                bo.putTileAt(-1,a.x,a.y);
                this.upd(1);
                break;
            case BoxType.N:
                if(b.state===EType.O){
                    bo.putTileAt(BoxType.O,a.x,a.y);
                }
                else{
                    bo.putTileAt(-1,a.x,a.y);
                    this.upd(1);
                }
                break;
            case BoxType.SILVER:
                if(b.state===EType.O){
                    bo.putTileAt(BoxType.N,a.x,a.y);
                }
                else if(b.state===EType.RED){
                    bo.putTileAt(BoxType.O,a.x,a.y);
                }
                else{
                    bo.putTileAt(-1,a.x,a.y);
                    this.upd(1);
                }
                break;
            case BoxType.BLUE:
                bo.putTileAt(-1,a.x,a.y);
                this.upd(1);
                const x=new Bubble(this,BType.BLUE);
                x.setUnit(a);
                x.start(2000);
                break;
            case BoxType.RED:
                bo.putTileAt(-1,a.x,a.y);
                this.upd(1);
                const y=new Bubble(this,BType.RED);
                y.setUnit(a);
                y.start(2000);
                break;
            case BoxType.BLACK:
                bo.putTileAt(-1,a.x,a.y);
                this.upd(1);
                const z=new Bubble(this,BType.BLACK);
                z.setUnit(a);
                z.start(2000);
                break;
            case BoxType.GREEN:
                bo.putTileAt(-1,a.x,a.y);
                this.upd(1);
                const w=new Bubble(this,BType.GREEN);
                w.setUnit(a);
                w.start(2000);
                break;
            case BoxType.PURPLE:
                bo.putTileAt(-1,a.x,a.y);
                this.upd(1);
                const v=new Bubble(this,BType.PURPLE);
                v.setUnit(a);
                v.start(2000);
                break;
            case BoxType.DARK:
                if(b.state===EType.RED||b.state===EType.BLACK){
                    bo.putTileAt(-1,a.x,a.y);
                    this.upd(1);
                }
                break;
            case BoxType.GOLD:
                bo.putTileAt(-1,a.x,a.y);
                this.upd(2);
                break;
            default:break;
            }
        });
        this.egroup!.children.iterate((c)=>{
            this.physics.world.disable(c);
            return true;
        });
    }
    pop(b:Bubble){
        this.sound.play("explode");
        switch(b.type){
        case BType.BLUE:
            for(let i=0;i<=2;i++){
                iterateX(i,v=>{
                    const x=b.getUnit().add(v);
                    if(!this.board!.check(x))return;
                    const l=new Explosion(this,EType.O);
                    l.setUnit(x);
                    l.activate();
                    this.time.addEvent({
                        delay:500,
                        callback:()=>{
                            l.sprite.destroy();
                        }
                    });
                });
            }
            break;
        case BType.RED:
            for(let i=0;i<=1;i++){
                iterateX(i,v=>{
                    const x=b.getUnit().add(v);
                    if(!this.board!.check(x))return;
                    const l=new Explosion(this,EType.RED);
                    l.setUnit(x);
                    l.activate();
                    this.time.addEvent({
                        delay:500,
                        callback:()=>{
                            l.sprite.destroy();
                        }
                    });
                });
            }
            iterateH(1,1,v=>{
                const x=b.getUnit().add(v);
                if(!this.board!.check(x))return;
                const l=new Explosion(this,EType.O);
                l.setUnit(x);
                l.activate();
                this.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            });
            break;
        case BType.GREEN:
            for(let i=0;i<this.board!.map.width;i++){
                const l=new Explosion(this,EType.O);
                l.setUnit(new Phaser.Math.Vector2(i,b.getUnit().y));
                l.activate();
                this.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            }
            for(let j=0;j<this.board!.map.height;j++){
                if(j==b.getUnit().y){
                    continue;
                }
                const l=new Explosion(this,EType.O);
                l.setUnit(new Phaser.Math.Vector2(b.getUnit().x,j));
                l.activate();
                this.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            }
            break;
        case BType.BLACK:
            iterateX(1,v=>{
                const x=b.getUnit().add(v);
                if(!this.board!.check(x))return;
                const l=new Explosion(this,EType.BLACK);
                l.setUnit(x);
                l.activate();
                this.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            });
            break;
        case BType.PURPLE:
            iterateO(1,1,v=>{
                const x=b.getUnit().add(v);
                if(!this.board!.check(x))return;
                if(!this.board!.has(x))return;
                const l=new Explosion(this,EType.RED);
                l.setUnit(x);
                l.activate();
                this.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            });
            break;
        default:break;
        }
    }
    upd(x:number){
        this.s.events.emit("score",this.score+=x);
        
    }
}

export class Start extends Phaser.Scene{
    main:Phaser.Scene[];
    constructor(c?:string){
        super(c);
        this.main=[];
    }
    init(){
        this.scene.add("pause",new Pause(this,"pause"),true);
    }
    preload(){
        this.load.image("grass",grass);
    }
    create(){
        this.add.tileSprite(0,0,800,800,"grass").setOrigin(0,0);
        const b=new Button(this,()=>{
            this.scene.add("S",new S(this,"S"),true);
            this.scene.sleep(this);
        });
        b.outBack=0xff0000;
        b.outText="#ffffff";
        b.overBack=0x00ff00;
        b.overText="#000000";
        b.setText("Start");
        b.setPosition(300,350);
        b.setSize(200,100);
        b.setDepth(1);
        b.activate();
        
    }
    pause(){
        this.main.forEach(s=>{
            this.scene.pause(s);
        });
    }
    resume(){
        this.main.forEach(s=>{
            this.scene.resume(s);
        });
    }
    clear(){
        this.main.forEach(s=>{
            this.scene.stop(s);
            this.scene.remove(s);
        });
        this.main.splice(0,this.main.length);
    }
}

export class Pause extends Phaser.Scene{
    start:Start;
    constructor(s:Start,c?:string){
        super(c);
        this.start=s;
    }
    init(){
        const w=400,h=400;
        
        this.cameras.main.setBackgroundColor("rgba(255,0,0,0.5)");
        this.scene.sleep(this);
        this.events.on("wake",()=>{
            const x=(this.scale.gameSize.width-w)/2,y=(this.scale.gameSize.height-h)/2;
            console.log(this.scale.gameSize);
            console.log(this.scale.baseSize);
            console.log(this.scale.displaySize);
            this.cameras.main.setViewport(x,y,w,h);
        });
    }
    create(){
        this.add.text(200,200,"PAUSED").setOrigin(0.5,0.5);
        const b=new Button(this,()=>{
            this.start.resume();
            this.scene.sleep(this);
        });
        b.outBack=0xff0000;
        b.outText="#ffffff";
        b.overBack=0x00ff00;
        b.overText="#000000";
        b.setText("Resume");
        b.setPosition(150,300);
        b.setSize(100,50);
        b.setDepth(1);
        b.activate();
    }
    
}
