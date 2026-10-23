export function compactKdsLocationV1(value){
 const text=String(value||"");const match=/^THẺ RUNG\s+(\d+)\s*-\s*THẺ RUNG\s*-\s*(TẠI CHỖ|MANG VỀ)$/iu.exec(text.trim());
 return match?`Thẻ ${match[1]} · ${match[2].toLocaleLowerCase("vi")}`:text;
}
export function splitKdsItemLabelV1(value){
 const text=String(value||"");const match=/^(.*?) · Topping TOÀN DÒNG \((\d+) phần\): (.*)$/s.exec(text);
 return match?{name:match[1],detail:`Topping chung ${match[2]} phần: ${match[3]}`}:{name:text,detail:""};
}
