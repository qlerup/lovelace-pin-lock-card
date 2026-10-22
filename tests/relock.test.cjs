const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const registry=new Map();
const tag=(strings,...values)=>({strings,values});
class Element {requestUpdate(){}}
const context=vm.createContext({window:{LitElement:Element,html:tag,css:tag},HTMLElement:Element,
  customElements:{get:name=>registry.get(name),define:(name,value)=>registry.set(name,value)},
  console:{info(){}},setTimeout,setInterval,clearInterval,navigator:{language:'en'}});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../pin-lock-card.js'),'utf8'),context);
const Card=registry.get('pin-lock-card');
for(const [value,expected] of [[0,Infinity],['0',Infinity],[undefined,60],[null,60],[30,30],['invalid',60],[-1,60]]){
  test(`relock_seconds=${value}`,()=>{
    const card=new Card();card._config={codes:['2468'],relock_seconds:value};card._entered='2468';
    const before=Date.now();card._tryUnlock();
    assert.ok(card._isUnlocked);
    if(expected===Infinity){assert.equal(card._unlockUntil,Infinity);assert.equal(card._remaining,null);}
    else assert.ok(Math.abs(card._unlockUntil-before-expected*1000)<100);
    card._lockNow();assert.equal(card._isUnlocked,0);
  });
}
