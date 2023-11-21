import Phaser from "phaser";
import {Keyboard} from "./ctrl";
import {Bubble,Boy,Board,Terrain,BType,Pivot,BoxType,EType,Explosion,Player} from "./model";
import {iterateX} from "./utils";
import bub from "../assets/bubble.png";
import boy from "../assets/boy.png";
import girl from "../assets/girl.png";
import blk from "../assets/blocks.png";
import expl from "../assets/explosion.png";
import box from "../assets/boxes.png";
import loon from "../assets/Laura Shigihara - Loonboon.mp3";
import explode from "../assets/explosion.wav";


export class BaseScene extends Phaser.Scene{
    board?:Board;
    keyboard?:Keyboard;
    egroup?:Phaser.Physics.Arcade.Group;
    constructor(){
        super("BaseScene");
        
    }
    preload(){
        this.load.spritesheet("bub",bub,{frameWidth:46,frameHeight:46});
        this.load.spritesheet("boy",boy,{frameWidth:48,frameHeight:60});
        this.load.spritesheet("girl",girl,{frameWidth:48,frameHeight:60});
        this.load.spritesheet("block",blk,{frameWidth:40,frameHeight:40});
        this.load.spritesheet("expl",expl,{frameWidth:40,frameHeight:40});
        this.load.spritesheet("box",box,{frameWidth:40,frameHeight:40});
        //this.load.image("expl",expl);
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
    pop(b:Bubble){
        this.sound.play("explode");
        switch(b.type){
        case BType.BLUE:
            for(let i=-1;i<=1;i++){
                for(let j=-1;j<=1;j++){
                    const l=new Explosion(this,EType.O);
                    l.setUnit(b.getUnit().add(new Phaser.Math.Vector2(i,j)));
                    l.activate();
                    this.time.addEvent({
                        delay:500,
                        callback:()=>{
                            l.sprite.destroy();
                        }
                    });

                }
            }
            break;
        case BType.RED:
            [Player.getBaseVelocity(Pivot.W),Player.getBaseVelocity(Pivot.E),Player.getBaseVelocity(Pivot.N),Player.getBaseVelocity(Pivot.S),new Phaser.Math.Vector2(0,0)].forEach(v=>{
                const l=new Explosion(this,EType.RED);
                l.setUnit(b.getUnit().add(v));
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
            [Pivot.W,Pivot.S,Pivot.E,Pivot.N].forEach(p=>{
                const l=new Explosion(this,EType.BLACK);
                l.setUnit(b.getUnit().add(Player.getBaseVelocity(p)));
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
            iterateX(2,(v)=>{
                const l=new Explosion(this,EType.O);
                l.setUnit(b.getUnit().add(v));
                l.activate();
                this.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            });
            /*for(let i=-2;i<=2;i++){
                for(let j=-2;j<=2;j++){
                    if(Math.random()<0.5){
                        continue;
                    }
                    const l=new Explosion(this,EType.RED);
                    try{
                        l.setUnit(b.getUnit().add(new Phaser.Math.Vector2(i,j)));
                    }catch(e){
                        l.sprite.destroy();
                        continue;
                    }
                    
                    l.activate();
                    this.time.addEvent({
                        delay:500,
                        callback:()=>{
                            l.sprite.destroy();
                        }
                    });
                }
            }*/
            break;
        default:break;
        }
    }
}

export class S extends BaseScene{
    boy?:Boy;
    create(){
        super.create();
        const w=40,h=40;
        this.board=new Board(this,w,h);
        
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
                    
                    //s.fill(Math.random()<0.3?BoxType.BLACK:BoxType.GREEN,i,j,1,1);
                }

            }
        }
        s.setCollisionBetween(0,100);

        this.boy=new Boy(this);
        
        //new Bubble(this,0).start(3000);
        //this.boy.setPosition({x:200,y:200});
        this.boy.setUnit({x:10,y:10});
        this.boy.activate();
        this.boy.sprite.body.setSize(10,10,false);
        this.boy.sprite.body.setOffset(19,45);
        this.physics.add.collider(this.boy.sprite,l);
        this.physics.add.collider(this.boy.sprite,s);
        this.cameras.main.startFollow(this.boy.sprite).setBounds(0,0,this.board.map.widthInPixels,this.board.map.heightInPixels);
        this.sound.play("bgm",{loop:true});
    }
    update(time: number, delta: number){
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
            a=a as Phaser.Types.Physics.Arcade.GameObjectWithBody;
            b=b as Phaser.Types.Physics.Arcade.GameObjectWithBody;

            console.log(b.state);
        });
        this.physics.overlap(bo,this.egroup!,(b,a)=>{
            a=a as Phaser.Tilemaps.Tile;
            b=b as Phaser.Types.Physics.Arcade.GameObjectWithBody;
            
            //console.log((b as any).index);
            switch(a.index){
            case BoxType.O:
                bo.putTileAt(-1,a.x,a.y);
                //bo.putTileAt()
                //a.index=-1;
                break;
            case BoxType.N:
                if(b.state===EType.O){
                    //bo.fill(BoxType.O,a.x,a.y,1,1);
                    bo.putTileAt(BoxType.O,a.x,a.y);
                    //a.index=BoxType.O;
                }
                else{
                    bo.fill(-1,a.x,a.y,1,1);
                    //bo.putTileAt(-1,a.x,a.y);
                    //a.index=-1;
                }
                break;
            case BoxType.SILVER:
                if(b.state===EType.O){
                    //a.index=BoxType.N;
                    bo.putTileAt(BoxType.N,a.x,a.y);
                }
                else if(b.state===EType.RED){
                    //a.index=BoxType.O;
                    bo.putTileAt(BoxType.O,a.x,a.y);
                }
                else{
                    //a.index=-1;
                    bo.putTileAt(-1,a.x,a.y);
                }
                break;
            case BoxType.BLUE:
                //a.index=-1;
                bo.putTileAt(-1,a.x,a.y);
                const x=new Bubble(this,BType.BLUE);
                x.setUnit(a);
                x.start(2000);
                break;
            case BoxType.RED:
                //a.index=-1;
                bo.putTileAt(-1,a.x,a.y);
                const y=new Bubble(this,BType.RED);
                y.setUnit(a);
                y.start(2000);
                break;
            case BoxType.BLACK:
                //a.index=-1;
                bo.putTileAt(-1,a.x,a.y);
                const z=new Bubble(this,BType.BLACK);
                z.setUnit(a);
                z.start(2000);
                break;
            case BoxType.GREEN:
                //a.index=-1;
                bo.putTileAt(-1,a.x,a.y);
                const w=new Bubble(this,BType.GREEN);
                w.setUnit(a);
                w.start(2000);
                break;
            case BoxType.PURPLE:
                //a.index=-1;
                bo.putTileAt(-1,a.x,a.y);
                const v=new Bubble(this,BType.PURPLE);
                v.setUnit(a);
                v.start(2000);
                break;
            case BoxType.DARK:
                if(b.state===EType.RED||b.state===EType.BLACK){
                    //a.index=-1;
                    bo.putTileAt(-1,a.x,a.y);
                }
                break;
            default:break;
            }
            //a.resetCollision();
        });
        this.egroup!.children.iterate((c)=>{
            this.physics.world.disable(c);
            return true;
        });
        //this.board!.map.setCollisionByExclusion([-1]);
    }
}