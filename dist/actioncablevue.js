!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.ActionCableVue=e():t.ActionCableVue=e()}("undefined"!=typeof self?self:this,(()=>(()=>{"use strict";var t={d:(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e)},e={};t.d(e,{default:()=>W});var n={logger:"undefined"!=typeof console?console:void 0,WebSocket:"undefined"!=typeof WebSocket?WebSocket:void 0},o={log(...t){this.enabled&&(t.push(Date.now()),n.logger.log("[ActionCable]",...t))}};const i=()=>(new Date).getTime(),r=t=>(i()-t)/1e3;class s{constructor(t){this.visibilityDidChange=this.visibilityDidChange.bind(this),this.connection=t,this.reconnectAttempts=0}start(){this.isRunning()||(this.startedAt=i(),delete this.stoppedAt,this.startPolling(),addEventListener("visibilitychange",this.visibilityDidChange),o.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`))}stop(){this.isRunning()&&(this.stoppedAt=i(),this.stopPolling(),removeEventListener("visibilitychange",this.visibilityDidChange),o.log("ConnectionMonitor stopped"))}isRunning(){return this.startedAt&&!this.stoppedAt}recordMessage(){this.pingedAt=i()}recordConnect(){this.reconnectAttempts=0,delete this.disconnectedAt,o.log("ConnectionMonitor recorded connect")}recordDisconnect(){this.disconnectedAt=i(),o.log("ConnectionMonitor recorded disconnect")}startPolling(){this.stopPolling(),this.poll()}stopPolling(){clearTimeout(this.pollTimeout)}poll(){this.pollTimeout=setTimeout((()=>{this.reconnectIfStale(),this.poll()}),this.getPollInterval())}getPollInterval(){const{staleThreshold:t,reconnectionBackoffRate:e}=this.constructor;return 1e3*t*Math.pow(1+e,Math.min(this.reconnectAttempts,10))*(1+(0===this.reconnectAttempts?1:e)*Math.random())}reconnectIfStale(){this.connectionIsStale()&&(o.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${r(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`),this.reconnectAttempts++,this.disconnectedRecently()?o.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${r(this.disconnectedAt)} s`):(o.log("ConnectionMonitor reopening"),this.connection.reopen()))}get refreshedAt(){return this.pingedAt?this.pingedAt:this.startedAt}connectionIsStale(){return r(this.refreshedAt)>this.constructor.staleThreshold}disconnectedRecently(){return this.disconnectedAt&&r(this.disconnectedAt)<this.constructor.staleThreshold}visibilityDidChange(){"visible"===document.visibilityState&&setTimeout((()=>{!this.connectionIsStale()&&this.connection.isOpen()||(o.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`),this.connection.reopen())}),200)}}s.staleThreshold=6,s.reconnectionBackoffRate=.15;var c={message_types:{welcome:"welcome",disconnect:"disconnect",ping:"ping",confirmation:"confirm_subscription",rejection:"reject_subscription"},disconnect_reasons:{unauthorized:"unauthorized",invalid_request:"invalid_request",server_restart:"server_restart",remote:"remote"},default_mount_path:"/cable",protocols:["actioncable-v1-json","actioncable-unsupported"]};const{message_types:l,protocols:u}=c,a=u.slice(0,u.length-1),h=[].indexOf;class d{constructor(t){this.open=this.open.bind(this),this.consumer=t,this.subscriptions=this.consumer.subscriptions,this.monitor=new s(this),this.disconnected=!0}send(t){return!!this.isOpen()&&(this.webSocket.send(JSON.stringify(t)),!0)}open(){if(this.isActive())return o.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`),!1;{const t=[...u,...this.consumer.subprotocols||[]];return o.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${t}`),this.webSocket&&this.uninstallEventHandlers(),this.webSocket=new n.WebSocket(this.consumer.url,t),this.installEventHandlers(),this.monitor.start(),!0}}close({allowReconnect:t}={allowReconnect:!0}){if(t||this.monitor.stop(),this.isOpen())return this.webSocket.close()}reopen(){if(o.log(`Reopening WebSocket, current state is ${this.getState()}`),!this.isActive())return this.open();try{return this.close()}catch(t){o.log("Failed to reopen WebSocket",t)}finally{o.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`),setTimeout(this.open,this.constructor.reopenDelay)}}getProtocol(){if(this.webSocket)return this.webSocket.protocol}isOpen(){return this.isState("open")}isActive(){return this.isState("open","connecting")}triedToReconnect(){return this.monitor.reconnectAttempts>0}isProtocolSupported(){return h.call(a,this.getProtocol())>=0}isState(...t){return h.call(t,this.getState())>=0}getState(){if(this.webSocket)for(let t in n.WebSocket)if(n.WebSocket[t]===this.webSocket.readyState)return t.toLowerCase();return null}installEventHandlers(){for(let t in this.events){const e=this.events[t].bind(this);this.webSocket[`on${t}`]=e}}uninstallEventHandlers(){for(let t in this.events)this.webSocket[`on${t}`]=function(){}}}d.reopenDelay=500,d.prototype.events={message(t){if(!this.isProtocolSupported())return;const{identifier:e,message:n,reason:i,reconnect:r,type:s}=JSON.parse(t.data);switch(this.monitor.recordMessage(),s){case l.welcome:return this.triedToReconnect()&&(this.reconnectAttempted=!0),this.monitor.recordConnect(),this.subscriptions.reload();case l.disconnect:return o.log(`Disconnecting. Reason: ${i}`),this.close({allowReconnect:r});case l.ping:return null;case l.confirmation:return this.subscriptions.confirmSubscription(e),this.reconnectAttempted?(this.reconnectAttempted=!1,this.subscriptions.notify(e,"connected",{reconnected:!0})):this.subscriptions.notify(e,"connected",{reconnected:!1});case l.rejection:return this.subscriptions.reject(e);default:return this.subscriptions.notify(e,"received",n)}},open(){if(o.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`),this.disconnected=!1,!this.isProtocolSupported())return o.log("Protocol is unsupported. Stopping monitor and disconnecting."),this.close({allowReconnect:!1})},close(t){if(o.log("WebSocket onclose event"),!this.disconnected)return this.disconnected=!0,this.monitor.recordDisconnect(),this.subscriptions.notifyAll("disconnected",{willAttemptReconnect:this.monitor.isRunning()})},error(){o.log("WebSocket onerror event")}};class f{constructor(t,e={},n){this.consumer=t,this.identifier=JSON.stringify(e),function(t,e){if(null!=e)for(let n in e){const o=e[n];t[n]=o}}(this,n)}perform(t,e={}){return e.action=t,this.send(e)}send(t){return this.consumer.send({command:"message",identifier:this.identifier,data:JSON.stringify(t)})}unsubscribe(){return this.consumer.subscriptions.remove(this)}}class b{constructor(t){this.subscriptions=t,this.pendingSubscriptions=[]}guarantee(t){-1==this.pendingSubscriptions.indexOf(t)?(o.log(`SubscriptionGuarantor guaranteeing ${t.identifier}`),this.pendingSubscriptions.push(t)):o.log(`SubscriptionGuarantor already guaranteeing ${t.identifier}`),this.startGuaranteeing()}forget(t){o.log(`SubscriptionGuarantor forgetting ${t.identifier}`),this.pendingSubscriptions=this.pendingSubscriptions.filter((e=>e!==t))}startGuaranteeing(){this.stopGuaranteeing(),this.retrySubscribing()}stopGuaranteeing(){clearTimeout(this.retryTimeout)}retrySubscribing(){this.retryTimeout=setTimeout((()=>{this.subscriptions&&"function"==typeof this.subscriptions.subscribe&&this.pendingSubscriptions.map((t=>{o.log(`SubscriptionGuarantor resubscribing ${t.identifier}`),this.subscriptions.subscribe(t)}))}),500)}}class p{constructor(t){this.consumer=t,this.guarantor=new b(this),this.subscriptions=[]}create(t,e){const n="object"==typeof t?t:{channel:t},o=new f(this.consumer,n,e);return this.add(o)}add(t){return this.subscriptions.push(t),this.consumer.ensureActiveConnection(),this.notify(t,"initialized"),this.subscribe(t),t}remove(t){return this.forget(t),this.findAll(t.identifier).length||this.sendCommand(t,"unsubscribe"),t}reject(t){return this.findAll(t).map((t=>(this.forget(t),this.notify(t,"rejected"),t)))}forget(t){return this.guarantor.forget(t),this.subscriptions=this.subscriptions.filter((e=>e!==t)),t}findAll(t){return this.subscriptions.filter((e=>e.identifier===t))}reload(){return this.subscriptions.map((t=>this.subscribe(t)))}notifyAll(t,...e){return this.subscriptions.map((n=>this.notify(n,t,...e)))}notify(t,e,...n){let o;return o="string"==typeof t?this.findAll(t):[t],o.map((t=>"function"==typeof t[e]?t[e](...n):void 0))}subscribe(t){this.sendCommand(t,"subscribe")&&this.guarantor.guarantee(t)}confirmSubscription(t){o.log(`Subscription confirmed ${t}`),this.findAll(t).map((t=>this.guarantor.forget(t)))}sendCommand(t,e){const{identifier:n}=t;return this.consumer.send({command:e,identifier:n})}}class g{constructor(t){this._url=t,this.subscriptions=new p(this),this.connection=new d(this),this.subprotocols=[]}get url(){return function(t){if("function"==typeof t&&(t=t()),t&&!/^wss?:/i.test(t)){const e=document.createElement("a");return e.href=t,e.href=e.href,e.protocol=e.protocol.replace("http","ws"),e.href}return t}(this._url)}send(t){return this.connection.send(t)}connect(){return this.connection.open()}disconnect(){return this.connection.close({allowReconnect:!1})}ensureActiveConnection(){if(!this.connection.isActive())return this.connection.open()}addSubProtocol(t){this.subprotocols=[...this.subprotocols,t]}}function y(t){const e=document.head.querySelector(`meta[name='action-cable-${t}']`);if(e)return e.getAttribute("content")}function m(t){return m="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},m(t)}function v(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,S(o.key),o)}}function _(t,e,n){return(e=S(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function S(t){var e=function(t){if("object"!=m(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var n=e.call(t,"string");if("object"!=m(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==m(e)?e:e+""}var w=function(){return t=function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"error";!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),_(this,"_debug",void 0),_(this,"_debugLevel",void 0),this._debug=e,this._debugLevel=n},e=[{key:"log",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"error";!this._debug||"all"!==this._debugLevel&&e!==this._debugLevel||console.log("[".concat(e.toUpperCase(),"] ").concat(t))}}],e&&v(t.prototype,e),Object.defineProperty(t,"prototype",{writable:!1}),t;var t,e}();function O(t){return O="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},O(t)}function j(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,o=Array(e);n<e;n++)o[n]=t[n];return o}function A(t){return t.$?t.$.type.channels:t.channels||t.$options.channels}function k(t){return t.$options.channels||t.channels||t.$&&t.$.type.channels}function C(t){if(k(t)&&t.$cable&&t.$cable._unsubscribeOnUnmount){var e=A(t);Object.entries(e).forEach((function(e){var n,o,i=(o=2,function(t){if(Array.isArray(t))return t}(n=e)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var o,i,r,s,c=[],l=!0,u=!1;try{if(r=(n=n.call(t)).next,0===e){if(Object(n)!==n)return;l=!1}else for(;!(l=(o=r.call(n)).done)&&(c.push(o.value),c.length!==e);l=!0);}catch(t){u=!0,i=t}finally{try{if(!l&&null!=n.return&&(s=n.return(),Object(s)!==s))return}finally{if(u)throw i}}return c}}(n,o)||function(t,e){if(t){if("string"==typeof t)return j(t,e);var n={}.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?j(t,e):void 0}}(n,o)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()),r=i[0],s=i[1];"computed"===r?s.forEach((function(e){var n=e.channelName.call(t);t.$cable._removeChannel(n,t._uid)})):t.$cable._removeChannel(r,t._uid)}))}}function P(t){if(k(t)){Object.keys||(Object.keys=(n=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable.call(!1,"toString"),r=(i=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"]).length,function(t){if("function"!=typeof t&&("object"!==O(t)||null===t))throw new TypeError("Object.keys called on non-object");var e,s,c=[];for(e in t)n.call(t,e)&&c.push(e);if(o)for(s=0;s<r;s++)n.call(t,i[s])&&c.push(i[s]);return c})),Object.entries||(Object.entries=function(t){for(var e=Object.keys(t),n=e.length,o=new Array(n);n--;)o[n]=[e[n],t[e[n]]];return o});var e=A(t);Object.entries(e).forEach((function(e){t.$cable._registerChannel(e,t)}))}var n,o,i,r}const $={beforeCreate:function(){P(this)},beforeUnmount:function(){C(this)},beforeDestroy:function(){C(this)},methods:{$resubscribeToCableChannels:function(){P(this)}}};function E(t){return E="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},E(t)}function x(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,o=Array(e);n<e;n++)o[n]=t[n];return o}function T(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,o)}return n}function R(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?T(Object(n),!0).forEach((function(e){I(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):T(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function U(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,D(o.key),o)}}function I(t,e,n){return(e=D(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function D(t){var e=function(t){if("object"!=E(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var n=e.call(t,"string");if("object"!=E(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==E(e)?e:e+""}var M=function(){return t=function t(e,n){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),I(this,"_logger",null),I(this,"_cable",null),I(this,"_channels",{subscriptions:{}}),I(this,"_contexts",{}),I(this,"_connectionUrl",null),I(this,"_unsubscribeOnUnmount",!0),I(this,"_isReset",!1),3===Number(e.version.split(".")[0])?e.config.globalProperties.$cable=this:e.prototype.$cable=this,e.mixin($);var o=R(R({},{debug:!1,debugLevel:"error",connectionUrl:y("url"),connectImmediately:!0,unsubscribeOnUnmount:!0,store:null}),n),i=o.debug,r=o.debugLevel,s=o.connectionUrl,c=o.connectImmediately,l=o.store,u=o.unsubscribeOnUnmount;this._connectionUrl=s,this._unsubscribeOnUnmount=u,this._logger=new w(i,r),!1!==s&&function(){throw new TypeError('"connectImmediately" is read-only')}(),l&&(l.$cable=this),c&&this._connectionUrl&&this._connect(this._connectionUrl),this._attachConnectionObject()},e=[{key:"subscribe",value:function(t,e){var n=this;if(this._cable){var o=e||t.channel;this._channels.subscriptions[o]=this._cable.subscriptions.create(t,{connected:function(){n._fireChannelEvent(o,n._channelConnected)},disconnected:function(){n._fireChannelEvent(o,n._channelDisconnected)},rejected:function(){n._fireChannelEvent(o,n._subscriptionRejected)},received:function(t){n._fireChannelEvent(o,n._channelReceived,t)}})}else this._connect(this._connectionUrl),this.subscribe(t,e)}},{key:"perform",value:function(t){var e=t.channel,n=t.action,o=t.data;this._logger.log("Performing action '".concat(n,"' on channel '").concat(e,"'."),"info");var i=this._channels.subscriptions[e];if(!i)throw new Error("You need to be subscribed to perform action '".concat(n,"' on channel '").concat(e,"'."));i.perform(n,o),this._logger.log("Performed '".concat(n,"' on channel '").concat(e,"'."),"info")}},{key:"unsubscribe",value:function(t){this._unsubscribeOnUnmount&&this._channels.subscriptions[t]&&(this._channels.subscriptions[t].unsubscribe(),this._logger.log("Unsubscribed from channel '".concat(t,"'."),"info"))}},{key:"_channelConnected",value:function(t){t.connected&&t.connected.call(this._contexts[t._uid].context),this._logger.log("Successfully connected to channel '".concat(t._name,"'."),"info")}},{key:"_channelDisconnected",value:function(t){t.disconnected&&t.disconnected.call(this._contexts[t._uid].context),this._logger.log("Successfully disconnected from channel '".concat(t._name,"'."),"info")}},{key:"_subscriptionRejected",value:function(t){t.rejected&&t.rejected.call(this._contexts[t._uid].context),this._logger.log("Subscription rejected for channel '".concat(t._name,"'."))}},{key:"_channelReceived",value:function(t,e){t.received&&t.received.call(this._contexts[t._uid].context,e),this._logger.log("Message received on channel '".concat(t._name,"'."),"info")}},{key:"_connect",value:function(t){this._cable=function(t=y("url")||c.default_mount_path){return new g(t)}("function"==typeof t?t():t)}},{key:"_attachConnectionObject",value:function(){var t=this;this.connection={connect:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;e&&(t._connectionUrl=e),t._cable?t._cable.connect():t._connect(e||t._connectionUrl),t._isReset&&t._resubscribe()},disconnect:function(){t._cable&&(t._cable.disconnect(),t._isReset=!0,t._reset())}}}},{key:"_registerChannel",value:function(t,e){var n=this,o=function(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var o,i,r,s,c=[],l=!0,u=!1;try{if(r=(n=n.call(t)).next,0===e){if(Object(n)!==n)return;l=!1}else for(;!(l=(o=r.call(n)).done)&&(c.push(o.value),c.length!==e);l=!0);}catch(t){u=!0,i=t}finally{try{if(!l&&null!=n.return&&(s=n.return(),Object(s)!==s))return}finally{if(u)throw i}}return c}}(t,e)||function(t,e){if(t){if("string"==typeof t)return x(t,e);var n={}.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?x(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}(t,2),i=o[0],r=o[1];"computed"!==i?this._addChannel(i,r,e):r.forEach((function(t){var o=t.channelName.call(e),i={connected:t.connected,rejected:t.rejected,disconnected:t.disconnected,received:t.received};n._addChannel(o,i,e)}))}},{key:"_addChannel",value:function(t,e,n){var o=n._uid||n.$.uid;e._uid=o,e._name=t,this._channels[t]||(this._channels[t]=[]),this._addContext(n),!this._channels[t].find((function(t){return t._uid===o}))&&this._contexts[o]&&this._channels[t].push(e)}},{key:"_addContext",value:function(t){var e=t._uid||t.$.uid;void 0!==e&&(this._contexts[e]={context:t})}},{key:"_removeChannel",value:function(t,e){this._channels[t]&&(this._channels[t].splice(this._channels[t].findIndex((function(t){return t._uid===e})),1),delete this._contexts[e],0===this._channels[t].length&&this._channels.subscriptions[t]&&(this._channels.subscriptions[t].unsubscribe(),delete this._channels.subscriptions[t]),this._logger.log("Unsubscribed from channel '".concat(t,"'."),"info"))}},{key:"_fireChannelEvent",value:function(t,e,n){if(Object.prototype.hasOwnProperty.call(this._channels,t))for(var o=this._channels[t],i=0;i<o.length;i++)e.call(this,o[i],n)}},{key:"_reset",value:function(){this._cable=null,this._channels={subscriptions:{}}}},{key:"_resubscribe",value:function(){var t=this;Object.keys(this._contexts).forEach((function(e){var n,o,i=null===(n=t._contexts[e])||void 0===n?void 0:n.context;null==i||null===(o=i.$resubscribeToCableChannels)||void 0===o||o.call(i)}))}}],e&&U(t.prototype,e),Object.defineProperty(t,"prototype",{writable:!1}),t;var t,e}();const W={install:function(t,e){var n=e.connectionUrl,o=void 0===n?null:n,i=e.debug,r=void 0!==i&&i,s=e.debugLevel,c=void 0===s?"all":s,l=e.connectImmediately,u=void 0===l||l,a=e.store;return new M(t,{connectionUrl:o,debug:r,debugLevel:c,connectImmediately:u,store:void 0===a?null:a})}};return e.default})()));