import Phaser from "phaser";
import EventEmitter from "eventemitter3";
import {EnvScene,SpriteKey,PlayerKey,AudioKey} from "./scene";
import {IterateUtils,SceneUtils} from "./utils";
import {Bar,Button,Plate} from "./ui";
import {Keyboard,ValidKeyCodes} from "./ctrl";

export enum Terrain{
    EMPTY,
    TREE,
    CACTUS
}
export enum BubbleType{
    BLUE,
    RED,
    BLACK,
    GREEN,
    PURPLE
}
export enum ExplosionType{
    O,
    RED,
    BLACK
}
export enum BoxType{
    O,
    N,
    RED,
    GREEN,
    PURPLE,
    BLUE,
    BLACK,
    SILVER,
    DARK,
    GOLD,
    MAN
}
export enum SkillType{
    BLUE,
    RED,
    BLACK,
    GREEN,
    PURPLE,
    MOVE,
    RELOAD,
    NO
}

export class Board{
    scene:EnvScene;
    map:Phaser.Tilemaps.Tilemap;
    ground:Phaser.Tilemaps.TilemapLayer;
    box:Phaser.Tilemaps.TilemapLayer;
    constructor(scene:EnvScene,width:number,height:number){
        this.scene=scene;
        this.map=scene.add.tilemap(undefined,40,40,width,height);
        this.map.addTilesetImage("block",SpriteKey.BLK);
        this.map.addTilesetImage("box",SpriteKey.BOX);
        this.ground=this.map.createBlankLayer("ground","block")!;
        this.box=this.map.createBlankLayer("box","box")!;
    }
    private findTile({x,y}:Phaser.Types.Math.Vector2Like){
        const t=this.ground.getTileAtWorldXY(x||0,y||0);
        if(t==null){
            throw new Error("no tile");
        }
        return t;
    }
    reg({x,y}:Phaser.Types.Math.Vector2Like){
        const t=this.findTile({x,y});
        return this.cent(t);
    }
    unit({x,y}:Phaser.Types.Math.Vector2Like){
        const t=this.findTile({x,y});
        return new Phaser.Math.Vector2(t);
        
    }
    private getTile({x,y}:Phaser.Types.Math.Vector2Like){
        const t=this.ground.getTileAt(x||0,y||0);
        if(t==null){
            throw new Error("no tile");
        }
        return t;
    }
    cent({x,y}:Phaser.Types.Math.Vector2Like){
        const t=this.getTile({x,y});
        return new Phaser.Math.Vector2(t.getCenterX(),t.getCenterY());
    }

    check(v:Phaser.Math.Vector2){
        return v.x>=0&&v.y>=0&&v.x<this.map.width&&v.y<this.map.height;
    }
    hasBox(v:Phaser.Math.Vector2){
        return this.box.hasTileAt(v.x,v.y);
    }

}

abstract class BasePhysicsModel{
    board:Board;
    sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    constructor(board:Board,sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
        this.board=board;
        this.sprite=sprite;
        this.deactivate();
    }
    activate(){
        this.sprite.setActive(true).setVisible(true);
    }
    deactivate(){
        this.sprite.setActive(false).setVisible(false);
    }
    setPosition({x,y}:Phaser.Types.Math.Vector2Like){
        this.sprite.setPosition(x,y);
    }
    setUnit({x,y}:Phaser.Types.Math.Vector2Like){
        this.setPosition(this.board.cent({x,y}));
    }
    setVelocity({x,y}:Phaser.Types.Math.Vector2Like){
        this.sprite.setVelocity(x||0,y);
    }
    getPosition(){
        return new Phaser.Math.Vector2(this.sprite.x,this.sprite.y);
    }
}

export class BoardLike extends BasePhysicsModel{
    protected v:Phaser.Math.Vector2;
    constructor(board:Board,sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
        super(board,sprite);
        this.v=new Phaser.Math.Vector2();
    }
    setUnit({x,y}:Phaser.Types.Math.Vector2Like){
        super.setUnit({x,y});
        this.v=new Phaser.Math.Vector2(x,y);
    }
    getUnit(){
        return this.v.clone();
    }
}

export class Bubble extends BoardLike{
    type:BubbleType;
    constructor(board:Board,type:BubbleType){
        super(board,board.scene.physics.add.sprite(0,0,"bub"));
        this.type=type;
    }
    
}

export class Explosion extends BoardLike{
    type:ExplosionType;
    constructor(board:Board,type:ExplosionType){
        super(board,board.scene.physics.add.sprite(0,0,"expl"));
        this.type=type;
        this.sprite.setFrame(type);
        //this.board.scene.egroup!.add(this.sprite);
        this.sprite.state=type;
    }
}

export enum Pivot{
    W,
    S,
    E,
    N
}

class PlayerInput{
    pivot?:Pivot;
    bubble?:BubbleType;
    skill?:SkillType;
}

export class Player extends BasePhysicsModel{
    pivot:Pivot;
    walking:boolean;
    text:Phaser.GameObjects.Text;
    no:boolean;
    blink:Phaser.Time.TimerEvent;
    input:PlayerInput;
    key:PlayerKey;
    constructor(board:Board,key:PlayerKey){
        super(board,board.scene.physics.add.sprite(0,0,key));
        this.pivot=Pivot.S;
        this.walking=false;
        this.text=board.scene.add.text(0,0,"").setDepth(2).setOrigin(0.5,0.5).setFontStyle("bold");
        this.no=false;
        this.input=new PlayerInput();
        this.key=key;
        this.blink=board.scene.time.addEvent({
            delay:100,
            loop:true,
            callback:()=>{
                this.sprite.setVisible(!this.no);
            }
        });
        /*this.input.on("walk",p=>{
            this.pivot=p;
            this.sprite.play(`${key}${p}`);
        });
        this.input.on("stop",()=>{
            this.sprite.setFrame(this.board.scene.anims.get(`${key}${this.pivot}`).getFrameAt(0).frame);
        });*/
    }
    getBaseVelocity(){
        return Player.getBaseVelocity(this.pivot);
    }
    static getBaseVelocity(p:Pivot){
        return Player.baseVelocity[p].clone();
    }
    private static readonly baseVelocity={
        [Pivot.W]:new Phaser.Math.Vector2(-1,0),
        [Pivot.S]:new Phaser.Math.Vector2(0,1),
        [Pivot.E]:new Phaser.Math.Vector2(1,0),
        [Pivot.N]:new Phaser.Math.Vector2(0,-1),
    };
    update(){
        this.text.setPosition(this.sprite.x,this.sprite.y+30);
    }
    cam(w?:number,h?:number){
        return this.board.scene.cameras.add(undefined,undefined,w,h).setBounds(0,0,this.board.map.widthInPixels,this.board.map.heightInPixels).startFollow(this.sprite);
    }
    start(pivot:Pivot){
        if(this.walking&&pivot===this.pivot){
            return;
        }
        this.walking=true;
        this.pivot=pivot;
        
        switch(this.key){
        case PlayerKey.BOY:
            break;
        default:break;
        }

        this.setVelocity(this.getBaseVelocity().scale(100));
        //this.sprite.play(`boy${this.pivot}`);
    }
    stop(){
        if(!this.walking){
            return;
        }
        this.walking=false;
        this.setVelocity({x:0,y:0});
        this.sprite.stop();
        //this.sprite.setFrame(this.board.scene.anims.get(`boy${this.pivot}`).getFrameAt(0).frame);
    }
}

export abstract class Env<R extends object> extends EventEmitter<{
    done:[R],
    pause:[],
    resume:[],
    launch:[]
}>{
    scenes:EnvScene[];
    constructor(...scenes:EnvScene[]){
        super();
        this.scenes=scenes;
    }
    pause(){
        for(const s of this.scenes){
            SceneUtils.pause(s);
        }
        this.emit("pause");
    }
    resume(){
        for(const s of this.scenes){
            SceneUtils.resume(s);
        }
        this.emit("resume");
    }
    done(r?:R){
        for(const s of this.scenes){
            SceneUtils.remove(s);
        }
        this.scenes=[];
        this.emit("done",r||this.quitResult());
    }
    launch(){
        for(const s of this.scenes){
            SceneUtils.launch(s);
        }
        this.emit("launch");
        this.reset();
    }
    abstract quitResult():R;
    abstract reset():void;
}

export class BoxEnv extends Env<{
    score:number
}>{
    main:EnvScene;
    s:EnvScene;
    player!:Player;
    board!:Board;
    egroup!:Phaser.Physics.Arcade.Group;
    score:number;
    time:number;
    bluecd:number;
    redcd:number;
    text!:Phaser.GameObjects.Text;
    timebar!:Bar;
    pb!:Plate;
    pr!:Plate;
    blink!:Phaser.Time.TimerEvent;
    keys!:Record<ValidKeyCodes,Phaser.Input.Keyboard.Key>;
    constructor(main:EnvScene,s:EnvScene,pkey:PlayerKey){
        super(main,s);
        this.main=main;
        this.s=s;
        this.score=0;
        this.time=0;
        this.bluecd=0;
        this.redcd=0;

        this.s.myEvents.on("create",()=>{

            this.s.add.tileSprite(0,0,200,600,SpriteKey.GRASS,0).setOrigin(0,0);
            this.text=this.s.add.text(100,100,"0").setOrigin(0.5,0.5).setColor("#fff000").setFontSize(20);
            this.timebar=new Bar(this.s);
            this.timebar.setMax(180000);
            this.timebar.setColor(0xffffff);
            this.timebar.setPosition(50,200);
            this.timebar.setLineWidth(2);
            this.timebar.setSize(100,20);
            this.timebar.activate();
            
            this.pb=new Plate(this.s);
            this.pb.setColor(0x5050ff);
            this.pb.setPosition(50,400);
            this.pb.setSize(25);
            this.pb.setMax(100);
            this.pb.activate();

            this.pr=new Plate(this.s);
            this.pr.setColor(0xff0000);
            this.pr.setPosition(150,400);
            this.pr.setSize(25);
            this.pr.setMax(100);
            this.pr.activate();
            
            
            const b=new Button(this.s,()=>{
                this.pause();
            });
            b.defaults();
            b.setText("Pause");
            b.setPosition(50,300);
            b.setSize(100,50);
            b.activate();
            
            this.s.cameras.main.setViewport(600,0,200,600);
        });

        this.main.myEvents.on("create",()=>{
            
            const w=20,h=20;
            this.board=new Board(this.main,w,h);
            this.egroup=this.main.physics.add.group();
            this.main.sound.play(AudioKey.LOON,{loop:true});

            this.main.scale.resize(800,600);

            this.board.ground.fill(Terrain.EMPTY,0,0,w,h);
            this.board.ground.fill(Terrain.TREE,0,0,w,1);
            this.board.ground.fill(Terrain.TREE,0,h-1,w,1);
            this.board.ground.fill(Terrain.TREE,0,0,1,h);
            this.board.ground.fill(Terrain.TREE,w-1,0,1,h);

            for(let i=0;i<20;i++){
                const x=Math.floor(Math.random()*(w-2)+1);
                const y=Math.floor(Math.random()*(h-2)+1);
                if(x==10&&y==10){
                    i--;
                    continue;
                }
                this.board.ground.putTileAt(Terrain.CACTUS,x,y);
            }

            //const ee=new PlayerInput();
            this.keys=Keyboard.getKeyboardKeys(this.main);
            this.keys.A.on("down",()=>{
                this.player.pivot=Pivot.W;
            });
            this.keys.D.on("down",()=>{
                this.player.pivot=Pivot.E;
            });
            this.keys.W.on("down",()=>{
                this.player.pivot=Pivot.N;
            });
            this.keys.S.on("down",()=>{
                this.player.pivot=Pivot.S;
            });

            this.player=new Player(this.board,pkey);
            this.player.setUnit({x:10,y:10});
            this.player.activate();
            this.player.sprite.body.setSize(10,10,false);
            this.player.sprite.body.setOffset(19,45);
            this.main.physics.add.collider(this.player.sprite,this.board.box);
            this.main.physics.add.collider(this.player.sprite,this.board.ground);

            this.gen();

            this.main.cameras.addExisting(this.player.cam(600,600),true);
        });
        this.main.myEvents.on("update",(t,delta)=>{
            this.time=Math.max(0,this.time-delta);
            this.timebar.setCur(this.time);
            this.bluecd=Math.min(100,this.bluecd+delta*0.05);
            this.pb.setCur(this.bluecd);
            this.redcd=Math.min(100,this.redcd+delta*0.04);
            this.pr.setCur(this.redcd);

            if(this.timebar.cur==0){
                this.done({score:this.score});
                return;
            }
            
            if(this.keys.A.isUp&&this.keys.D.isUp&&this.keys.W.isUp&&this.keys.S.isUp){
                this.player.input.pivot=undefined;
            }else{
                this.player.input.pivot=this.player.pivot;
            }
            


            this.main.physics.overlap(this.player.sprite,this.egroup,(a,b)=>{
                if(this.player.no)return;
                a=a as Phaser.Types.Physics.Arcade.GameObjectWithBody;
                b=b as Phaser.Types.Physics.Arcade.GameObjectWithBody;
                this.setNo(this.player,true);
                this.main.time.addEvent({
                    delay:1000,
                    callback:()=>{
                        this.setNo(this.player,false);
                    }
                });
                switch(b.state){
                case ExplosionType.O:
                    this.upd(-1);
                    break;
                case ExplosionType.RED:
                    this.upd(-2);
                    break;
                case ExplosionType.BLACK:
                    this.upd(-3);
                    break;
                default:break;
                }
            });
            const bo=this.board.box;
            this.main.physics.overlap(bo,this.egroup!,(b,a)=>{
                a=a as Phaser.Tilemaps.Tile;
                b=b as Phaser.Types.Physics.Arcade.GameObjectWithBody;
                
                switch(a.index){
                case BoxType.O:
                    bo.putTileAt(-1,a.x,a.y);
                    this.upd(1);
                    break;
                case BoxType.N:
                    if(b.state===ExplosionType.O){
                        bo.putTileAt(BoxType.O,a.x,a.y);
                    }
                    else{
                        bo.putTileAt(-1,a.x,a.y);
                        this.upd(1);
                    }
                    break;
                case BoxType.SILVER:
                    if(b.state===ExplosionType.O){
                        bo.putTileAt(BoxType.N,a.x,a.y);
                    }
                    else if(b.state===ExplosionType.RED){
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
                    const x=new Bubble(this.board,BubbleType.BLUE);
                    x.setUnit(a);
                    this.start(x,2000);
                    break;
                case BoxType.RED:
                    bo.putTileAt(-1,a.x,a.y);
                    this.upd(1);
                    const y=new Bubble(this.board,BubbleType.RED);
                    y.setUnit(a);
                    this.start(y,2000);
                    break;
                case BoxType.BLACK:
                    bo.putTileAt(-1,a.x,a.y);
                    this.upd(1);
                    const z=new Bubble(this.board,BubbleType.BLACK);
                    z.setUnit(a);
                    this.start(z,2000);
                    break;
                case BoxType.GREEN:
                    bo.putTileAt(-1,a.x,a.y);
                    this.upd(1);
                    const w=new Bubble(this.board,BubbleType.GREEN);
                    w.setUnit(a);
                    this.start(w,2000);
                    break;
                case BoxType.PURPLE:
                    bo.putTileAt(-1,a.x,a.y);
                    this.upd(1);
                    const v=new Bubble(this.board,BubbleType.PURPLE);
                    v.setUnit(a);
                    this.start(v,2000);
                    break;
                case BoxType.DARK:
                    if(b.state===ExplosionType.RED||b.state===ExplosionType.BLACK){
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
            this.egroup.clear();
        });
        this.launch();
    }
    quitResult(){
        return {score:this.score};
    }
    upd(v:number){
        this.text.setText((this.score+=v).toString());
    }
    start(b:Bubble,s:number){
        b.activate();
        b.sprite.play(`${SpriteKey.BUB}${b.type}`);
        this.board.scene.time.addEvent({
            delay:s,
            callback:()=>{
                this.pop(b);
                b.sprite.destroy();
            }
        });
    }
    pop(b:Bubble){
        this.main.sound.play("explode");
        switch(b.type){
        case BubbleType.BLUE:
            for(let i=0;i<=2;i++){
                IterateUtils.iterateX(i,v=>{
                    const x=b.getUnit().add(v);
                    if(!this.board.check(x))return;
                    const l=new Explosion(this.board,ExplosionType.O);
                    l.setUnit(x);
                    l.activate();
                    this.main.time.addEvent({
                        delay:500,
                        callback:()=>{
                            l.sprite.destroy();
                        }
                    });
                });
            }
            break;
        case BubbleType.RED:
            for(let i=0;i<=1;i++){
                IterateUtils.iterateX(i,v=>{
                    const x=b.getUnit().add(v);
                    if(!this.board.check(x))return;
                    const l=new Explosion(this.board,ExplosionType.RED);
                    l.setUnit(x);
                    l.activate();
                    this.main.time.addEvent({
                        delay:500,
                        callback:()=>{
                            l.sprite.destroy();
                        }
                    });
                });
            }
            IterateUtils.iterateH(1,1,v=>{
                const x=b.getUnit().add(v);
                if(!this.board.check(x))return;
                const l=new Explosion(this.board,ExplosionType.O);
                l.setUnit(x);
                l.activate();
                this.main.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            });
            break;
        case BubbleType.GREEN:
            for(let i=0;i<this.board.map.width;i++){
                const l=new Explosion(this.board,ExplosionType.O);
                l.setUnit(new Phaser.Math.Vector2(i,b.getUnit().y));
                l.activate();
                this.main.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            }
            for(let j=0;j<this.board.map.height;j++){
                if(j==b.getUnit().y){
                    continue;
                }
                const l=new Explosion(this.board,ExplosionType.O);
                l.setUnit(new Phaser.Math.Vector2(b.getUnit().x,j));
                l.activate();
                this.main.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            }
            break;
        case BubbleType.BLACK:
            IterateUtils.iterateX(1,v=>{
                const x=b.getUnit().add(v);
                if(!this.board.check(x))return;
                const l=new Explosion(this.board,ExplosionType.BLACK);
                l.setUnit(x);
                l.activate();
                this.main.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            });
            break;
        case BubbleType.PURPLE:
            IterateUtils.iterateO(1,1,v=>{
                const x=b.getUnit().add(v);
                if(!this.board.check(x))return;
                if(!this.board.hasBox(x))return;
                const l=new Explosion(this.board,ExplosionType.RED);
                l.setUnit(x);
                l.activate();
                this.main.time.addEvent({
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
    setNo(p:Player,b:boolean){
        if(b==p.no)return;
        p.no=b;
        if(b){
            p.blink.paused=false;
        }
        else{
            p.blink.paused=true;
            p.sprite.setVisible(true);
        }
    }
    gen(){
        for(let i=0;i<this.board.map.width;i++){
            for(let j=0;j<this.board.map.height;j++){
                if(this.player.getPosition().distance(this.board.cent({x:i,y:j}))<2*this.board.map.tileWidth)continue;
                const t=this.board.ground.getTileAt(i,j,true).index;
                if(t!=Terrain.EMPTY)continue;
                const t1=this.board.box.getTileAt(i,j,true).index;
                if(t1!=-1)continue;
                if(Math.random()<0.05){
                    this.board.box.putTileAt(BoxType.SILVER,i,j,true);
                }
                else if(Math.random()<0.05){
                    this.board.box.putTileAt(BoxType.GOLD,i,j,true);
                }
                else if(Math.random()<0.05){
                    this.board.box.putTileAt(BoxType.N,i,j,true);
                }
                else if(Math.random()<0.5){
                    this.board.box.putTileAt(BoxType.O,i,j,true);
                }
            }
        }
    }
    reset(){
        this.score=0;
        this.time=180000;
        this.bluecd=0;
        this.redcd=0;
        //this.timebar.setCur(180000);
    }
}

class PVPEnv{
    
}


