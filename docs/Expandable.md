<a name="Expandable"></a>

## Expandable
**Kind**: global class  

* [Expandable](#Expandable)
    * [new Expandable()](#new_Expandable_new)
    * [.init()](#Expandable.init)
    * [.collapse()](#Expandable.collapse)
    * [.expand()](#Expandable.expand)
    * [.hasUserInteracted()](#Expandable.hasUserInteracted) ⇒ <code>boolean</code>

<a name="new_Expandable_new"></a>

### new Expandable()
This class controls the expanding and collapsing of expandable units. The animation relys on the properties
set in the index. Therefore, the animation has be removed from the build file and handled internally.
This class can be extended with [ExpandableDcs](#ExpandableDcs) when units are used in DoubleClick.
<pre class="sunlight-highlight-javascript">
import { Expandable } from 'ad-control'
</pre>

<a name="Expandable.init"></a>

### Expandable.init()
This method initializes the class, linking all callbacks and the target being set. This should
	be called Control.postMarkup

**Kind**: static method of [<code>Expandable</code>](#Expandable)  
**Example**  
```js
Expandable.init ({
	// required
	target: View.expanded,

	// optional methods called when that event happens
	expandStart: Control.handleExpandStart,
	expandComplete: Control.handleExpandComplete,
	collapseStart: Control.handleCollapseStart,
	collapseComplete: Control.handleCollapseFinish,

	// optionally you can add time values for expanding/collapsing
	expandTime: 0.3,
	collapseTime: 0.3
})
```
<a name="Expandable.collapse"></a>

### Expandable.collapse()
Collapses the View.expand container.

**Kind**: static method of [<code>Expandable</code>](#Expandable)  
**Example**  
```js
Expandable.collapse()
```
<a name="Expandable.expand"></a>

### Expandable.expand()
Expands the View.expand container.

**Kind**: static method of [<code>Expandable</code>](#Expandable)  
**Example**  
```js
Expandable.expand()
```
<a name="Expandable.hasUserInteracted"></a>

### Expandable.hasUserInteracted() ⇒ <code>boolean</code>
**Kind**: static method of [<code>Expandable</code>](#Expandable)  
**Returns**: <code>boolean</code> - Indicates if the ad has been interacted by the user  
**Example**  
```js
console.log(Expandable.hasUserInteracted())
```
