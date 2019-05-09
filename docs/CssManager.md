<a name="CssManager"></a>

## CssManager
**Kind**: global class  

* [CssManager](#CssManager)
    * [new CssManager()](#new_CssManager_new)
    * [.init()](#CssManager.init)
    * [.setDebugLevel(level)](#CssManager.setDebugLevel)
    * [.setDebugFilter(filter)](#CssManager.setDebugFilter)

<a name="new_CssManager_new"></a>

### new CssManager()
This is a css-interface class, which is intended to proxy all css applications. The goal is to accept css in any format( see below ), 
standardize the keys, conform the values, and rapidly apply the style to the target, specific to the [Device](Device) running the ad.<br><br> 
Generally, you should not need to use this class directly. [Styles.setCss](Styles.setCss) will handle it for you.<br><br>
However, if your css is not being correctly managed, the first step in debugging is to use [setDebugFilter](#CssManager.setDebugFilter). Pass the id, 
as a string, of the misbehaving element to see the exact format of the css being applied to it. You can then locate the problem style, try 
applying it in the browser inspector. Using this approach you should be able to determine what the correction/exception needs to be.<br><br>
Additional debugging output can be switched on using [setDebugLevel](#CssManager.setDebugLevel). Pass a level( 0 is off, 1 is less, 2 is more ). There will be 
a lot of output, but it is organized and consistent. You should be able to see exactly what is happening to your declarations. <br><br>
<b>Types:</b><br>
<table>
	<tr><td>CssObject</td>	<td>the literal "css" object that is passed to [Markup](Markup) as containerData.css on the creation of the element</td></tr>
	<tr><td>CssStyleString</td>	<td>a literal string of any number of css styles, passed to [Markup](Markup) as containerData.styles on the creation of the element</td></tr>
	<tr><td>CssDeclaration</td>	<td>either an object like "{ position: 'absolute' }" or a string like "background-color: #ff0000;"</td></tr>
	<tr><td>CssKey</td>	<td>ex: in "position: absolute;" the css-key would be "position"</td></tr>
	<tr><td>CssValue</td>	<td>ex: in "position: absolute;" the css-value would be "absolute"</td></tr>
	<tr><td>CssList</td>	<td>a standardized list of objects with Device-specific keys and corresponding values</td></tr>
</table>
<br>
<b>Formats:</b><br>
<table>
	<tr><td>Hyphen</td>	<td>ex: 'border-left', '-webkit-clip-path', '-moz-filter'</td></tr>
	<tr><td>Camel</td>	<td>ex: 'borderLeft', 'webkitClipPath', 'moxFilter'</td></tr>
	<tr><td>Alt</td>	<td>this is to handle arbitrary exceptions, like the "bgImage" key on container-data css objects</td></tr>
</table>
<br>
<b>Key Prefixes:</b><br>
<table>
	<tr><td>Browser</td>	<td>ex: "-webkit-clip-path" or "webkitClipPath"</td></tr>
	<tr><td>Standard</td>	<td>ex: "clip-path" or "clipPath"</td></tr>
</table>
<pre class="sunlight-highlight-javascript">
import { CssManager } from 'ad-control'
</pre>

<a name="CssManager.init"></a>

### CssManager.init()
Called one time per life-cycle. Creates the browser key-dictionary.

**Kind**: static method of [<code>CssManager</code>](#CssManager)  
<a name="CssManager.setDebugLevel"></a>

### CssManager.setDebugLevel(level)
Use this to control the degree of logging that happens in this class. Debugging is off by default, or pass 0 or null to disable.

**Kind**: static method of [<code>CssManager</code>](#CssManager)  

| Param | Type | Description |
| --- | --- | --- |
| level | <code>number</code> | controls debug verbosity for all css processing, default is 0, max is 2 |

<a name="CssManager.setDebugFilter"></a>

### CssManager.setDebugFilter(filter)
Use this control to filter which <CssMananger>.apply() calls get output to the console.

**Kind**: static method of [<code>CssManager</code>](#CssManager)  

| Param | Type | Description |
| --- | --- | --- |
| filter | <code>string</code> | the filter string: An element.id, a css-key, or a css-value. For example, if you want to only see css being applied  	to particular element, pass its id to this function. Conversely, if you only want to see css with a particular  	key or value, pass that string. |

