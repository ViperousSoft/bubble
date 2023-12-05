import Phaser from "phaser";
import {MyScene,BaseScene} from "./scene";

export enum Terrain{
    EMPTY,
    TREE,
    CACTUS
}
export enum BType{
    BLUE,
    RED,
    BLACK,
    GREEN,
    PURPLE
}
export enum EType{
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

export abstract class UI{
    scene:MyScene<any>;
    constructor(scene:MyScene<any>){
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
    constructor(scene:MyScene<any>){
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
    //scene:BaseScene;
    border:Phaser.GameObjects.Arc;
    fill:Phaser.GameObjects.Arc;
    max:number;
    cur:number;
    constructor(scene:MyScene<any>){
        super(scene);
        this.border=scene.add.arc().setScrollFactor(0);
        this.fill=scene.add.arc().setScrollFactor(0);//new Phaser.Curves.Curve().
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

export class Board{
    scene:BaseScene<any>;
    map:Phaser.Tilemaps.Tilemap;
    constructor(scene:BaseScene<any>,width:number,height:number){
        this.scene=scene;
        this.map=scene.add.tilemap(undefined,40,40,width,height);
        this.map.addTilesetImage("block","block");
        this.map.addTilesetImage("box","box");
    }
    private findTile({x,y}:Phaser.Types.Math.Vector2Like){
        const t=this.map.getTileAtWorldXY(x||0,y||0,undefined,undefined,"ground");
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
        const t=this.map.getTileAt(x||0,y||0,undefined,"ground");
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
    has(v:Phaser.Math.Vector2){
        return this.map.getLayer("box")!.tilemapLayer.hasTileAt(v.x,v.y);
    }

}

abstract class BasePhysicsModel{
    scene:BaseScene<any>;
    sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    constructor(scene:BaseScene<any>,sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
        this.scene=scene;
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
        //const t=this.scene.board!.getTile({x,y});
        this.setPosition(this.scene.board!.cent({x,y}));
    }
    setVelocity({x,y}:Phaser.Types.Math.Vector2Like){
        this.sprite.setVelocity(x||0,y);
    }
}

export class BoardLike extends BasePhysicsModel{
    protected v:Phaser.Math.Vector2;
    constructor(scene:BaseScene<any>,sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
        super(scene,sprite);
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
    type:BType;
    constructor(scene:BaseScene<any>,type:BType){
        super(scene,scene.physics.add.sprite(0,0,"bub"));
        this.type=type;
    }
    start(s:number){
        this.activate();
        this.sprite.play(`bubble${this.type}`);
        this.scene.time.addEvent({
            delay:s,
            callback:()=>{
                this.scene.pop(this);
                this.sprite.destroy();
            }
        });
    }
}

export class Explosion extends BoardLike{
    type:EType;
    constructor(scene:BaseScene<any>,type:EType){
        super(scene,scene.physics.add.sprite(0,0,"expl"));
        this.type=type;
        this.sprite.setFrame(type);
        this.scene.egroup!.add(this.sprite);
        this.sprite.state=type;
    }
}

export enum Pivot{
    W,
    S,
    E,
    N
}

export abstract class Player extends BasePhysicsModel{
    pivot:Pivot;
    walking:boolean;
    constructor(scene:BaseScene<any>,sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
        super(scene,sprite);
        this.pivot=Pivot.S;
        this.walking=false;
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
    }
}

export class Boy extends Player{
    no:boolean;
    blink:Phaser.Time.TimerEvent;
    constructor(scene:BaseScene<any>){
        super(scene,scene.physics.add.sprite(0,0,"boy"));
        this.no=false;
        this.blink=scene.time.addEvent({
            delay:100,
            loop:true,
            paused:true,
            callback:()=>{
                this.sprite.setVisible(!this.sprite.visible);
            }
        });
    }
    
    start(pivot:Pivot){
        if(this.walking&&pivot===this.pivot){
            return;
        }
        this.walking=true;
        this.pivot=pivot;
        this.setVelocity(this.getBaseVelocity().scale(100));
        this.sprite.play(`boy${this.pivot}`);
    }
    stop(){
        if(!this.walking){
            return;
        }
        this.walking=false;
        this.setVelocity({x:0,y:0});
        this.sprite.stop();
        this.sprite.setFrame(this.scene.anims.get(`boy${this.pivot}`).getFrameAt(0).frame);
    }

    bubble(type:BType){
        const b=new Bubble(this.scene,type);
        b.setUnit(this.scene.board!.unit(this.sprite.body.center));
        return b;
    }
    setNo(v:boolean){
        if(this.no===v){
            return;
        }
        this.no=v;
        if(v){
            this.blink.paused=false;
        }
        else{
            this.blink.paused=true;
            this.sprite.setVisible(true);
        }
    }
}


export class Button extends UI{
    text:Phaser.GameObjects.Text;
    rect:Phaser.GameObjects.Rectangle;
    overBack:number;
    overText:string;
    outBack:number;
    outText:string;
    constructor(scene:MyScene<any>,onClick:()=>void){
        super(scene);
        this.overBack=0x888888;
        this.overText="#ffffff";
        this.outBack=0x555555;
        this.outText="#ffffff";
        this.text=scene.add.text(0,0,"").setOrigin(0.5,0.5).setScrollFactor(0);
        this.rect=scene.add.rectangle().setOrigin(0,0).setScrollFactor(0).setInteractive();
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
