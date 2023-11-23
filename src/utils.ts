import Phaser from "phaser";

export function iterateH(a:number,b:number,f:(m:Phaser.Math.Vector2)=>void){
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
export function iterateX(a:number,f:(v:Phaser.Math.Vector2)=>void){
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
export function iterateO(a:number,b:number,f:(v:Phaser.Math.Vector2)=>void){
    a=Math.abs(a);
    b=Math.abs(b);
    for(let i=-a;i<=a;i++){
        for(let j=-b;j<=b;j++){
            f(new Phaser.Math.Vector2(i,j));
        }
    }
}
