import sharp from "sharp";
import {mkdir,writeFile,copyFile} from "node:fs/promises";
import path from "node:path";
const media=path.resolve("public/media");
await mkdir(media,{recursive:true});
const sourceDirectory=process.env.SUMMIT_MEDIA_SOURCE_DIR;
if(!sourceDirectory)throw new Error("Set SUMMIT_MEDIA_SOURCE_DIR to the original generated image directory; see docs/media-prompts.md.");
const names={hero:"exec-e3b1a0ef-92c6-4ee7-9e9f-cea241385fe5.png",audio:"exec-6266913c-7da8-4ae5-acc4-67ab33808759.png",skincare:"exec-dfdb558f-db0c-415f-acb3-0f53bb4b267b.png"};
const inputs=Object.fromEntries(Object.entries(names).map(([key,name])=>[key,path.join(sourceDirectory,name)]));
for(const [name,input] of Object.entries(inputs))await sharp(input).resize({width:name==="hero"?1920:1200,withoutEnlargement:true}).webp({quality:85}).toFile(path.join(media,`${name}.webp`));
await sharp(inputs.hero).extract({left:710,top:0,width:950,height:941}).resize(1100).webp({quality:85}).toFile(path.join(media,"concept-fragrance.webp"));
await sharp(inputs.hero).extract({left:710,top:0,width:950,height:941}).resize(1100).webp({quality:85}).toFile(path.join(media,"fragrance-after.webp"));
await copyFile(path.join(media,"hero.webp"),path.join(media,"fragrance-obsidian.webp"));
const variants={before:"exec-049760a6-d335-4f11-9cff-52fe7d3bb399.png",arctic:"exec-f53109f2-3d32-405a-859b-95494c02906c.png",inferno:"exec-cd453281-c848-45e2-9866-8dc3a86ece60.png"};
for(const [name,file] of Object.entries(variants)){let source=sharp(path.join(sourceDirectory,file));if(name==="before")source=source.extract({left:710,top:0,width:950,height:941});await source.resize({width:name==="before"?1100:1672}).webp({quality:85}).toFile(path.join(media,`fragrance-${name}.webp`));}
await sharp(inputs.hero).resize(1200,630,{fit:"cover"}).jpeg({quality:86}).toFile("app/opengraph-image.jpg");
await mkdir(path.join(media,"sequence"),{recursive:true});
// Deterministic illustrated stills; this is deliberately not a reconstruction.
for(let frame=0;frame<12;frame++){
const theta=frame*Math.PI/6+.2;
const project=([x,y,z])=>[450+(x*Math.cos(theta)+z*Math.sin(theta))*190,550-y*190+(-x*Math.sin(theta)+z*Math.cos(theta))*46];
const depth=([x,,z])=>-x*Math.sin(theta)+z*Math.cos(theta);
const vertices=[[-.75,-.6,-.38],[.75,-.6,-.38],[.75,.85,-.38],[-.75,.85,-.38],[-.75,-.6,.38],[.75,-.6,.38],[.75,.85,.38],[-.75,.85,.38]];
const faces=[[0,1,2,3],[4,7,6,5],[0,3,7,4],[1,5,6,2],[3,2,6,7],[0,4,5,1]].sort((a,b)=>a.reduce((s,i)=>s+depth(vertices[i]),0)-b.reduce((s,i)=>s+depth(vertices[i]),0));
const points=indexes=>indexes.map(i=>project(vertices[i]).map(n=>n.toFixed(1)).join(",")).join(" ");
const body=faces.map((face,i)=>`<polygon points="${points(face)}" fill="url(#glass${i%2})" fill-opacity="${.48+i*.055}" stroke="#dfb35c" stroke-opacity=".62" stroke-width="1.2"/>`).join("");
const front=[[-.4,-.05,-.383],[.4,-.05,-.383],[.4,.45,-.383],[-.4,.45,-.383]];
const label=front.map(v=>project(v).map(n=>n.toFixed(1)).join(",")).join(" ");
const capY=550-1.49*190;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 800"><defs><radialGradient id="bg"><stop stop-color="#353329"/><stop offset="1" stop-color="#1b1b18"/></radialGradient><linearGradient id="glass0"><stop stop-color="#cfa65e"/><stop offset=".3" stop-color="#7a4512"/><stop offset=".75" stop-color="#b07928"/><stop offset="1" stop-color="#e5c077"/></linearGradient><linearGradient id="glass1" x2="0" y2="1"><stop stop-color="#dcb777"/><stop offset=".6" stop-color="#69491f"/><stop offset="1" stop-color="#b5802f"/></linearGradient><linearGradient id="cap"><stop stop-color="#111211"/><stop offset=".4" stop-color="#393a35"/><stop offset=".7" stop-color="#22231f"/><stop offset="1" stop-color="#0b0d0b"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="14"/></filter></defs><rect width="900" height="800" fill="url(#bg)"/><ellipse cx="450" cy="674" rx="175" ry="20" fill="#000" opacity=".5" filter="url(#blur)"/><ellipse cx="450" cy="688" rx="285" ry="42" stroke="#a69a7526" fill="none"/><path d="M130 688h40m560 0h40" stroke="#c5ad8066"/>${body}${Math.cos(theta)>0?`<polygon points="${label}" fill="#e1cd98" fill-opacity=".18" stroke="#dfc890" stroke-width=".5"/>`:""}<rect x="402" y="332" width="96" height="49" fill="url(#cap)"/><rect x="383" y="${capY}" width="134" height="93" rx="3" fill="url(#cap)" stroke="#6c6b5d" stroke-width=".7"/><ellipse cx="450" cy="${capY}" rx="67" ry="13" fill="#3e3f38" stroke="#777568" stroke-width=".8"/><ellipse cx="450" cy="${capY+93}" rx="67" ry="10" fill="#161713"/><path d="M395 ${capY+7}v72" stroke="#dedcc0" stroke-opacity=".18" stroke-width="2"/><text x="450" y="752" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" letter-spacing="3" fill="#a49c85">FORM STUDY / ${String(frame+1).padStart(2,"0")} OF 12</text></svg>`;
await writeFile(path.join(media,"sequence",`frame-${String(frame).padStart(2,"0")}.svg`),svg);
}
console.log("Optimized concepts, social image and 12 illustrated angles created.");
