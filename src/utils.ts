import Phaser from "phaser";

export class IterateUtils{
    static iterateH(a:number,b:number,f:(m:Phaser.Math.Vector2)=>void){
        a=Math.abs(a);
        b=Math.abs(b);
        if(a>b){
            [a,b]=[b,a];
        }
        if(a==0){
            if(b==0){
                f(new Phaser.Math.Vector2(0,0));
                return;
            }
            f(new Phaser.Math.Vector2(0,b));
            f(new Phaser.Math.Vector2(0,-b));
            f(new Phaser.Math.Vector2(b,0));
            f(new Phaser.Math.Vector2(-b,0));
            return;
        }
        
        if(a==b){
            f(new Phaser.Math.Vector2(a,a));
            f(new Phaser.Math.Vector2(a,-a));
            f(new Phaser.Math.Vector2(-a,a));
            f(new Phaser.Math.Vector2(-a,-a));
        }
        else{
            f(new Phaser.Math.Vector2(a,b));
            f(new Phaser.Math.Vector2(a,-b));
            f(new Phaser.Math.Vector2(-a,b));
            f(new Phaser.Math.Vector2(-a,-b));
            f(new Phaser.Math.Vector2(b,a));
            f(new Phaser.Math.Vector2(b,-a));
            f(new Phaser.Math.Vector2(-b,a));
            f(new Phaser.Math.Vector2(-b,-a));
        }
    }
    static iterateX(a:number,f:(v:Phaser.Math.Vector2)=>void){
        a=Math.abs(a);
        if(a==0){
            f(new Phaser.Math.Vector2(0,0));
            return;
        }
        for(let i=-a+1;i<0;i++){
            f(new Phaser.Math.Vector2(i,-a-i));
            f(new Phaser.Math.Vector2(i,a+i));
        }
        for(let i=0;i<a;i++){
            f(new Phaser.Math.Vector2(i,-a+i));
            f(new Phaser.Math.Vector2(i,a-i));
        }
        f(new Phaser.Math.Vector2(-a,0));
        f(new Phaser.Math.Vector2(a,0));
    }
    static iterateO(a:number,b:number,f:(v:Phaser.Math.Vector2)=>void){
        a=Math.abs(a);
        b=Math.abs(b);
        for(let i=-a;i<=a;i++){
            for(let j=-b;j<=b;j++){
                f(new Phaser.Math.Vector2(i,j));
            }
        }
    }
}

export class SceneUtils{
    static launch(scene:Phaser.Scene){
        scene.scene.launch(scene);
        scene.scene.bringToTop(scene);
    }

    static remove(scene:Phaser.Scene){
        scene.scene.remove(scene);
    }

    static shutdown(scene:Phaser.Scene){
        scene.scene.stop(scene);
        scene.scene.sendToBack(scene);
    }

    static pause(scene:Phaser.Scene){
        scene.scene.pause(scene);
    }

    static resume(scene:Phaser.Scene){
        scene.scene.resume(scene);
    }
}
