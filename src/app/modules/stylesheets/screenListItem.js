export const screenListItem = (data, itemclasses, newest) => `
<li
data-strapid="${data.strapid}" 
data-maxwidth="${data.maxwidth}"
data-default-height="${data.defaultHeight}"
class="stylesheet ${itemclasses} ${newest ? `activeStylesheet` : ``}"
id="screen-${data.strapid}">
<span class="name">#${data.strapid}</span>
<span class="width">Width: ${data.maxwidth}</span>
<span class="height">Height: ${data.defaultHeight}</span>
<span class="ratio">Max ratio: ${(data.maxwidth / data.defaultHeight).toFixed(2)} (${data.maxwidth}/${data.defaultHeight})</span>
<span class="remove">R</span>
</li>`;
