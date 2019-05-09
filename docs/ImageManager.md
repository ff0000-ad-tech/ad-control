<a name="ImageManager"></a>

## ImageManager
**Kind**: global class  

* [ImageManager](#ImageManager)
    * [new ImageManager()](#new_ImageManager_new)
    * [.addToLoad(file, arg)](#ImageManager.addToLoad) ⇒ <code>string</code>
    * [.addLoader(loader)](#ImageManager.addLoader)
    * [.get(imageId)](#ImageManager.get) ⇒ <code>Image</code>
    * [.available(imageId)](#ImageManager.available) ⇒ <code>boolean</code>
    * [.load(callback, onFail)](#ImageManager.load)
    * [.addToDictionary()](#ImageManager.addToDictionary)

<a name="new_ImageManager_new"></a>

### new ImageManager()
This module is used to add/load/manage all Images.
<pre class="sunlight-highlight-javascript">
import { ImageManager } from 'ad-control'
</pre>

<a name="ImageManager.addToLoad"></a>

### ImageManager.addToLoad(file, arg) ⇒ <code>string</code>
Add an image file-path to be loaded.

**Kind**: static method of [<code>ImageManager</code>](#ImageManager)  
**Returns**: <code>string</code> - An "imageId" which can be used to get an image by its id, see: [get](#ImageManager.get)  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>string</code> | A filename or path |
| arg | <code>object</code> | Optional. Determines if the image should be loaded with a crossOrigin:'anonymous' for images used in a canvas. An object with one boolean key: forCanvas |

**Example**  
```js
// Add an image from the "images/" folder
ImageManager.addToLoad(adParams.imagesPath + 'sample.png')

// Add an image full path, and get the result key back
var sampleImageId = ImageManager.addToLoad('http://some/full/file/path/sample.png')

// Add an image for use with CanvasDrawer, and get the result key back
// NOTE: The object must be there or images will error when used in Canvas
var sampleImageId = ImageManager.addToLoad('http://some/full/file/path/sample.png', { forCanvas:true })
```
<a name="ImageManager.addLoader"></a>

### ImageManager.addLoader(loader)
Add a Loader to loaded along with any other queued image requests.

**Kind**: static method of [<code>ImageManager</code>](#ImageManager)  

| Param | Type | Description |
| --- | --- | --- |
| loader | <code>Loader</code> | A [Loader](Loader). |

**Example**  
```js
ImageManager.addLoader(
	new Loader(
		assets.images, {
			name: 'imageLocalLoader',
			prepend: adParams.imagesPath
		}
	)
)
```
<a name="ImageManager.get"></a>

### ImageManager.get(imageId) ⇒ <code>Image</code>
**Kind**: static method of [<code>ImageManager</code>](#ImageManager)  
**Returns**: <code>Image</code> - Returns the <<b></b>img> that was created when the requested image was loaded in.  

| Param | Type | Description |
| --- | --- | --- |
| imageId | <code>string</code> | A String id of an Image |

**Example**  
```js
ImageManager.get('sample')
```
<a name="ImageManager.available"></a>

### ImageManager.available(imageId) ⇒ <code>boolean</code>
**Kind**: static method of [<code>ImageManager</code>](#ImageManager)  
**Returns**: <code>boolean</code> - If an image by the given imageID has been loaded  

| Param | Type | Description |
| --- | --- | --- |
| imageId | <code>string</code> | A String id of an Image |

**Example**  
```js
ImageManager.available('sample')
```
<a name="ImageManager.load"></a>

### ImageManager.load(callback, onFail)
Executes load queue, which, on success, will yield all of the requested images available with [get](#ImageManager.get)

**Kind**: static method of [<code>ImageManager</code>](#ImageManager)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | Callback to execute when all images are loaded. |
| onFail | <code>function</code> | Optional onFail callback - if not specified a failed load will cause the ad to failover. |

<a name="ImageManager.addToDictionary"></a>

### ImageManager.addToDictionary()
Allows images to be added to the ImageManager's dictionary from external classes. <b>This is not part of the load process, and can only add <i>loaded</i> image content.</b>

**Kind**: static method of [<code>ImageManager</code>](#ImageManager)  
