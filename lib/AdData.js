/**
	@class AdData
	@param {object} parsedJsonData 	
		raw json object

	@description
		Central data container for processing json and other pre-flight data.
		This is the local data container where you can prepare all of your json for easy access in your build.
		It was instantiated in {@link PrepareCommon.init} and is available on <code>adData</code>.
		<br><br>

		Operations common to this class may include parsing dates, assembling lists of images to preload, 
		creating hooks for additional modules, etc.
		<br>
	
		<codeblock>    
			// access the raw JSON like this
			global.adData.adDataRaw
			
			// assign a property in AdData like this
			self.myVar = true;

			// assign a property from anywhere like this
			adData.otherVar = [1,2,3];

			// access to a property from anywhere
			trace( adData.myVar ); // true
			trace( adData.otherVar ); // 1,2,3

			// store a DOM element such as a div or textfield in the elements var like this
			adData.elements.myDiv = Markup.addDiv({
				target:'redAdContainer',
				id:'my_div',
				styles:'position:absolute'
			});
		</codeblock>
 */	
import { Markup } from 'ad-view'

function AdData(){
	var self = this;
	
	self.elements = {};
	self.elements.redAdContainer = Markup.get( 'redAdContainer' );
	
	/*-- Red.Component.ad_data_init.start --*/
	/*-- Red.Component.ad_data_init.end --*/

	/*/////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////     EXTRACT JSON DATA HERE     ///////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////*/


	/* DYNAMIC IMAGES
		Dynamically loaded images need to be in their own directory, like "dynamic_images/".

		Then, you need to add your dynamic image-paths to the load-queue, so that when
		PrepareCommon performs the secondary preload, these assets will get loaded. For example:

		var theImageName = ImageManager.addToLoad( adParams.imagesPath + 'sample.jpg' );
	 */

	/*-- Red.Component.ad_data_misc.start --*/
	
	self.fonts = {
		/*-- Red.Component.ad_data_fonts.start --*/
		primary : 'template_font'
		/*-- Red.Component.ad_data_fonts.end --*/
	}

	self.colors = {
		/*-- Red.Component.ad_data_colors.start --*/
		/*-- Red.Component.ad_data_colors.end --*/
	}

	// Store svg markup for use in all UISvg instances, reduces duplicate code across builds.  See UISvg.
	self.svg = {
		/*-- Red.Component.ad_data_svg.start --*/
		/*-- Red.Component.ad_data_svg.end --*/
	}
	/*-- Red.Component.ad_data_misc.end --*/
}

export default AdData