/*
 * DDL Builder
 * Copyright Jake Feasel, 2012
 * Released under MIT license
 * For questions email admin at sqlfiddle dot com
 * http://github.com/jakefeasel/DDLBuilder
 */

define(["jQuery","Handlebars","DateFormat","text!./templates/generic.sql","text!./templates/oracle.sql","text!./templates/sqlite.sql","HandlebarsHelpers/each_with_index"],function(e,t,n,r,i,s){return ddl_builder=function(e){return e||(e={}),this.fieldPrefix="",this.fieldSuffix="",this.tablePrefix="",this.tableSuffix="",this.dateFormatMask="yyyy-mm-dd HH:MM:ss",this.charType="varchar",this.intType="int",this.floatType="numeric",this.dateType="datetime",this.valueSeparator="",this.column_count=0,this.definition={tableName:"Table1",columns:[],data:[]},this.ddlTemplate=r,this.compiledTemplate=t.compile(this.ddlTemplate),this.setup(e),this},ddl_builder.prototype.setup=function(e){for(var n in e)this[n]=e[n];return e.ddlTemplate&&(this.compiledTemplate=t.compile(this.ddlTemplate)),e.tableName&&(this.definition.tableName=e.tableName),this},ddl_builder.prototype.setupForDBType=function(e,t){switch(e){case"SQL Server":this.setup({statement_separator:t,fieldPrefix:"[",fieldSuffix:"]",tablePrefix:"[",tableSuffix:"]"});break;case"MySQL":this.setup({statement_separator:t,fieldPrefix:"`",fieldSuffix:"`",tablePrefix:"`",tableSuffix:"`"});break;case"PostgreSQL":this.setup({statement_separator:t,dateType:"timestamp",fieldPrefix:'"',fieldSuffix:'"'});break;case"Oracle":var n=i;this.setup({dateFormatMask:"dd-mmm-yyyy hh:MM:ss TT",statement_separator:t,ddlTemplate:n,dateType:"timestamp",charType:"varchar2",fieldPrefix:'"',fieldSuffix:'"'});break;case"SQLite":var n=s;this.setup({fieldPrefix:'"',fieldSuffix:'"',tablePrefix:'"',tableSuffix:'"',statement_separator:t,ddlTemplate:n,dateType:"DATE",charType:"TEXT",intType:"INTEGER",floatType:"REAL"})}return this},ddl_builder.prototype.populateDBTypes=function(){for(var e=0;e<this.definition.columns.length;e++)this.definition.columns[e].type=="charType"?this.definition.columns[e].db_type=this[this.definition.columns[e].type]+"("+this.definition.columns[e].length+")":this.definition.columns[e].db_type=this[this.definition.columns[e].type];this.definition.dateFormatMask=this.dateFormatMask},ddl_builder.prototype.populateWrappers=function(){this.definition.fieldPrefix=this.fieldPrefix,this.definition.fieldSuffix=this.fieldSuffix},ddl_builder.prototype.guessValueSeparator=function(t){var n=t.split("\n"),r=!1,i=0,s="";for(var o=0;o<n.length;o++)if(n[o].search(/[A-Z0-9_]/i)!=-1&&!r){var u=e.trim(n[o]).match(/([A-Z0-9_]+ ?)+([^A-Z0-9_]*)/gi);u.length==1&&(u=e.trim(n[o]).match(/([A-Z0-9_]+ ?)+?([^A-Z0-9_]*)/gi)),r=!0;for(var a=0;a<u.length;a++){var f=u[a].match(/[A-Z0-9_]+([^A-Z0-9_]*)$/i).pop();f.search(/^\s\s+$/)!=-1?f=new RegExp("\\s\\s+"):f.search(/^\t+$/)!=-1?f=new RegExp("\\t+"):f.search(/^\s+$/)!=-1?f=new RegExp("\\s+"):f=e.trim(f);if(f instanceof RegExp||f.length)if(s instanceof RegExp||!!s.length){if(s.toString()!=f.toString())return{status:!1,message:"Unable to find consistent column separator in header row"}}else s=f;else!(f instanceof RegExp)&&!(s instanceof RegExp)&&!s.length&&(s="\n")}s instanceof RegExp||s.length?i=e.trim(n[o]).split(s).length:i=1}else if(n[o].search(/[A-Z0-9_]/i)!=-1&&e.trim(n[o]).split(s).length!=i&&(s.toString()!=/\s\s+/.toString()||e.trim(n[o]).split(/\s+/).length!=i))return{status:!1,message:"Line "+o+' does not have the same number of columns as the header, based on separator "'+s+'".'};return{status:!0,separator:s,column_count:i}},ddl_builder.prototype.parse=function(t){var n=/^(?!Jan)(?!Feb)(?!Mar)(?!Apr)(?!May)(?!Jun)(?!Jul)(?!Aug)(?!Sep)(?!Oct)(?!Nov)(?!Dec)[A-Za-z\ \-\_]+\d+\s*$/,r={},i=[],s=[],o=[],u=0,a=0,f="";if(!this.valueSeparator.length){r=this.guessValueSeparator(t);if(!r.status)return"ERROR! "+r.message;this.column_count=r.column_count,this.valueSeparator=r.separator}i=t.split("\n");for(u=0;u<i.length;u++){s=e.trim(i[u]).split(this.valueSeparator);if(e.trim(i[u]).length&&(s.length==this.column_count||this.valueSeparator.toString()==/\s\s+/.toString()&&(s=e.trim(i[u]).split(/\s+/)).length==this.column_count))if(!this.definition.columns.length)for(a=0;a<s.length;a++)f=e.trim(s[a]),f.length?this.definition.columns.push({name:f}):this.definition.columns.push(!1);else{o=[];for(a=0;a<s.length;a++)if(this.definition.columns[a]!==!1){f=e.trim(s[a]).replace(/'/g,"''"),isNaN(f)||this.definition.columns[a].type=="dateType"||this.definition.columns[a].type=="charType"?this.definition.columns[a].type!="charType"&&!isNaN(Date.parse("UTC:"+f))&&!f.match(n)?this.definition.columns[a].type="dateType":this.definition.columns[a].type="charType":this.definition.columns[a].type!="floatType"&&f%1!=0?this.definition.columns[a].type="floatType":this.definition.columns[a].type="intType";if(!this.definition.columns[a].length||f.length>this.definition.columns[a].length)this.definition.columns[a].length=f.length;o.push({v:f})}this.definition.data.push({r:o})}}return this.populateDBTypes(),this.populateWrappers(),this.render()},t.registerHelper("formatted_field",function(e){var r="",i=-1;for(var s=0;s<e.columns.length;s++){e.columns[s]&&i++;if(i==this.index){r=e.columns[s].type;break}}return!this.v.length||this.v.toUpperCase()=="NULL"?"NULL":r=="charType"?new t.SafeString("'"+this.v+"'"):r=="dateType"?new t.SafeString("'"+n("UTC:"+this.v,e.dateFormatMask)+"'"):this.v}),t.registerHelper("column_name_for_index",function(e){return e.columns[this.index].name}),ddl_builder.prototype.render=function(){return this.compiledTemplate(e.extend(this.definition,{separator:this.statement_separator}))},ddl_builder})