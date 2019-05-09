<a name="SheetManager"></a>

## SheetManager
**Kind**: global class  

* [SheetManager](#SheetManager)
    * [new SheetManager()](#new_SheetManager_new)
    * [.createGlobalNode(nodeId, styles)](#SheetManager.createGlobalNode)
    * [.addClass(target, className)](#SheetManager.addClass)
    * [.removeClass(target, className)](#SheetManager.removeClass)

<a name="new_SheetManager_new"></a>

### new SheetManager()
Class manages the creation of &lt;style> tags and the addition/removal of classes.
<pre class="sunlight-highlight-javascript">
import { SheetManager } from 'ad-control'
</pre>

<a name="SheetManager.createGlobalNode"></a>

### SheetManager.createGlobalNode(nodeId, styles)
Create a new CSS node (class, tag, etc) DEFINITION with submitted styles with selector/CSS string
	pair or a self-contained CSS string including selectors.

**Kind**: static method of [<code>SheetManager</code>](#SheetManager)  

| Param | Type | Description |
| --- | --- | --- |
| nodeId | <code>string</code> | the id of the &lt;style> node written to the &lt;head> |
| styles | <code>string</code> | selector/CSS string pair as separate parameters, following 'selector', 'css string' pattern, 	or a self-contained CSS style string including selectors, like '.myClass{ color: blue; }' |

**Example**  
```js
// selector/CSS string pair
SheetManager.createGlobalNode ( 'myFirstStyle', 
	'.class-a', 'position:absolute; width:inherit;'
)

// or add multiple class declarations to the same node
SheetManager.createGlobalNode ( 'mySecondStyle', 
	'.class-b', 'position:absolute;',
	'.class-b-top', 'width:inherit; height:inherit;'
)

// or have mulitple classes share the same logic
SheetManager.createGlobalNode ( 'myThirdStyle', 
	'.class-c, .class-d', 'position:absolute;'
)

// add style to a tag globally
SheetManager.createGlobalNode ( 'myFourthStyle', 
	'h1', 'position:absolute;'
)

// self-contained CSS string
var myCssString = '.myClass, h1 { color: blue; margin: 10px; }';
SheetManager.createGlobalNode( 'myFifthStyle', myCssString );
```
<a name="SheetManager.addClass"></a>

### SheetManager.addClass(target, className)
Add a CSS class ASSOCIATION to the targeted element.

**Kind**: static method of [<code>SheetManager</code>](#SheetManager)  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>string</code> \| <code>element</code> | id or element to which css style should be added |
| className | <code>string</code> | css class association to be added to this target |

<a name="SheetManager.removeClass"></a>

### SheetManager.removeClass(target, className)
Removes a CSS class ASSOCIATION from the targeted element.

**Kind**: static method of [<code>SheetManager</code>](#SheetManager)  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>string</code> \| <code>element</code> | id or element from which css style should be removed |
| className | <code>string</code> | css class association to be removed from this target |

