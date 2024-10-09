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
<span class="ratio">Ratio: ${(data.maxwidth / data.defaultHeight).toFixed(2)} (${data.maxwidth}/${data.defaultHeight})</span>
<span class="applyStyleToRatio">Apply current style to ratio</span>
<span class="remove">Delete</span>
</li>`;
