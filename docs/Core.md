<a name="Core"></a>

## Core
**Kind**: global class  

* [Core](#Core)
    * [new Core()](#new_Core_new)
    * [.init(fbaLoader)](#Core.init)
    * [.loadDynamic()](#Core.loadDynamic)

<a name="new_Core_new"></a>

### new Core()
Boilerplate logic that is attempted for all ad templates happens here. The build of an ad should not need to affect this scope. 
<pre class="sunlight-highlight-javascript">
import { Core } from 'ad-control'
</pre>

<a name="Core.init"></a>

### Core.init(fbaLoader)
This is the first step in the build file. The init() returns a Promise, which allows for chaining of .then() methods.
	For synchronous actions, such as declaring AdData or FtData, simply wrap it in an anonymous function. For asynchronous
	actions, such a inititalizing something with a created callback, this will need to be wrapped in a returned callback.
	This will ensure that the chain will wait for the previous .then() to be fulfilled before moving on.

**Kind**: static method of [<code>Core</code>](#Core)  

| Param | Type | Description |
| --- | --- | --- |
| fbaLoader | <code>Loader</code> | Optionally passed in Loader when compiled |

**Example**  
```js
Core.init(fbaContent)
	.then(function() {
		global.adData = new AdData();
	})
	.then(function() {
		return new Promise((resolve, reject) => {
			// pass the resolve as the completed callback
			SomeCustomClass.init(resolve)
		})
	})
	.then(Core.loadDynamic)
	.then(Control.prepareBuild)
```
<a name="Core.loadDynamic"></a>

### Core.loadDynamic()
This is the last step before preparing the build. The loadDynamic() loads all of the images that have been added
	to the ImageLoader. After this method is called from the .then() promise chain, Control.prepareBuild can be 
	called as the entire prepare process is now complete when its Promise is fulfilled.

**Kind**: static method of [<code>Core</code>](#Core)  
**Example**  
```js
Core.init(fbaContent)
	.then(function() {
		global.adData = new AdData();
	})
	.then(Core.loadDynamic)
	.then(Control.prepareBuild)
```
