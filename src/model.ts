import Phaser from "phaser";
import {BaseScene} from "./scene";

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
    BLACK
}

export class Board{
    scene:BaseScene;
    map:Phaser.Tilemaps.Tilemap;
    constructor(scene:BaseScene,width:number,height:number){
        this.scene=scene;
        this.map=scene.add.tilemap(undefined,40,40,width,height);
        this.map.addTilesetImage("block","block");
    }
    private findTile({x,y}:Phaser.Types.Math.Vector2Like){
        const t=this.map.getTileAtWorldXY(x||0,y||0);
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
        const t=this.map.getTileAt(x||0,y||0);
        if(t==null){
            throw new Error("no tile");
        }
        return t;
    }
    cent({x,y}:Phaser.Types.Math.Vector2Like){
        const t=this.getTile({x,y});
        return new Phaser.Math.Vector2(t.getCenterX(),t.getCenterY());
    }
}

class BasePhysicsModel{
    scene:BaseScene;
    sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    constructor(scene:BaseScene,sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
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
    constructor(scene:BaseScene,sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
        super(scene,sprite);
        this.v=new Phaser.Math.Vector2();
    }
    setUnit({ x, y }: Phaser.Types.Math.Vector2Like): void {
        super.setUnit({x,y});
        this.v=new Phaser.Math.Vector2(x,y);
    }
    getUnit(){
        return this.v.clone();
    }
}

export class Bubble extends BoardLike{
    type:BType;
    constructor(scene:BaseScene,type:BType){
        super(scene,scene.physics.add.sprite(0,0,"bub"));
        this.type=type;
        //this.sprite.tint=type===BType.RED?0xff0000:type===BType.BLUE?0x0000ff:0x000000;

    }
    start(s:number){
        this.activate();
        this.sprite.play(`bubble${this.type}`);
        this.scene.time.addEvent({
            delay:s,
            callback:()=>{
                this.pop();
                this.sprite.destroy();
            }
        });
    }
    pop(){
        this.scene.sound.play("explode");
        switch(this.type){
        case BType.BLUE:
            [Pivot.W,Pivot.E,Pivot.N,Pivot.S].forEach(element => {
                const l=new Explosion(this.scene,EType.O);
                l.setUnit(this.getUnit().add(Player.getBaseVelocity(element)));
                //console.log(l.v);
                l.activate();
                this.scene.time.addEvent({
                    delay:500,
                    callback:()=>{
                        l.sprite.destroy();
                    }
                });
            });
            
            break;
        }
    }

}

export class Explosion extends BoardLike{
    type:EType;
    constructor(scene:BaseScene,type:EType){
        super(scene,scene.physics.add.sprite(0,0,"expl"));
        this.type=type;
        this.sprite.setFrame(type);
    }
}

export enum Pivot{
    W,
    S,
    E,
    N
}

export class Player extends BasePhysicsModel{
    pivot:Pivot;
    walking:boolean;
    constructor(scene:BaseScene,sprite:Phaser.Types.Physics.Arcade.SpriteWithDynamicBody){
        super(scene,sprite);
        this.pivot=Pivot.S;
        this.walking=false;
    }
    getBaseVelocity(){
        return Player.baseVelocity[this.pivot].clone();
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
    cd:boolean[];
    constructor(scene:BaseScene){
        super(scene,scene.physics.add.sprite(0,0,"boy"));
        this.cd=[true,true,true];
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
        if(this.cd[type]){
            this.cd[type]=false;
            //const t=this.scene.board!.find(this.sprite.getCenter());
            const b=new Bubble(this.scene,type);
            b.setUnit(this.scene.board!.unit(this.sprite.body.center));
            //b.setPosition(this.scene.board!.reg(this.sprite.getCenter()));
            b.start(3000);
            this.scene.time.addEvent({
                delay:5000,
                callback:()=>{
                    this.cd[type]=true;
                }
            });
        }
    }
}

