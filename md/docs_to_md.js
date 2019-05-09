const jsdoc2mdPlugin = require('@ff0000-ad-tech/fat-jsdoc-to-md')
jsdoc2mdPlugin.createFromClasses(`${__dirname}/../`, `${__dirname}/README.hbs`)
