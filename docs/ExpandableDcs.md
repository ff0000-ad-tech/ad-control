<a name="ExpandableDcs"></a>

## ExpandableDcs
**Kind**: global class  
<a name="new_ExpandableDcs_new"></a>

### new ExpandableDcs()
This is and extension of [Expandable](#Expandable) when units are used in DoubleClick. The only difference in the 
init() method is to pass in this class to the Expandable.init()
<pre class="sunlight-highlight-javascript">
import { ExpandableDcs } from 'ad-control'

Expandable.init ({
	target : View.expanded,
	expandStart: Control.handleExpandStart,
	expandComplete: Control.handleExpandComplete,
	collapseStart: Control.handleCollapseStart,
	collapseComplete: Control.handleCollapseFinish,

	extend: ExpandableDcs
})
</pre>

