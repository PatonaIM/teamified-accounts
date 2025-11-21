//$Id$
class messageboardsdk{
    constructor(domainID,orgId,messagepanel_iconId){
        this.serviceId=domainID.serviceid;
        this.orgId=orgId;
        this.domain=domainID.inproductdomain;
        this.messagepanel_iconId=document.getElementById(messagepanel_iconId);
        this.customizePanelStyle();
        this.customizeMessageStyle();
        this.setOnClickCallback();
    }
  
    customizePanelStyle(panelstyle={}){
        this.panelJson=panelstyle;
    }
  
    customizeMessageStyle(messagestyle={}){
        this.styleJson=messagestyle;
    }
  
    customizeStyles(styles={}){
        if(Object.keys(styles).length > 1){
            styles.messageStyle?this.customizeMessageStyle(styles.messageStyle):'';
            styles.panelStyle?this.customizePanelStyle(styles.panelStyle):'';
        }
    }
  
    setOnClickCallback(funcName){
        this.callback=funcName;
    }
  
    changeOrg(orgID)
    {   if(this.mics_iframe){
        this.messagepanel_iconId.style["pointer-events"] = "none";
        this.messagepanel_iconId.style.opacity = this.panelJson.panelIconOpacity || "0.4";
        document.getElementById("stackedNumber").style.display = 'none';
        this.iconDisabled = true;
        this.mics_iframe.contentWindow.postMessage({
            "type": "orgUpdate",
            "orgID": orgID
        },this.domain);
    }
    }
  
    updateMessageStyle(styleJSON) {
        if(this.mics_iframe){
        this.mics_iframe.contentWindow.postMessage({
            "type": "styleUpdate",
            "styles": styleJSON
        },this.domain);
    }
    }
    initialize(){
        this.urlsrc="https://"+document.domain+"/mics/analytics/stacked.jsp?frameorigin=https://"+document.domain;
        var tipDomain=this.domain.split('//')[1].replace("tipengine.","").split('.').reverse();
        var domainCheck=(document.domain).split('.').reverse();
        domainCheck=domainCheck.slice(0,tipDomain.length).join('');
        tipDomain=tipDomain.join('');
        if(tipDomain===domainCheck){
            this.urlsrc=this.domain+"/analytics/stacked.jsp?frameorigin=https://"+document.domain;
        }
    else{
    this.domain="https://"+document.domain;    
    }
        (this.messagepanel_iconId).innerHTML += '<span style="display:none" id="stackedNumber" >0</span>';
        this.messagepanel_iconId.style["pointer-events"] = "none";
        if (this.messagepanel_iconId.style.opacity >= 1 || this.messagepanel_iconId.style.opacity == "") {
            this.messagepanel_iconId.style.opacity = this.panelJson.panelIconOpacity||"0.2";
        }
        this.mics_iframeDiv = document.createElement("div");
        this.mics_iframeDiv.id = "mics_stacked_carpet";
        this.panelJson.iframePosition =='left' ? this.mics_iframeDiv.className = "micsPanelLeft": this.mics_iframeDiv.className = "micsPanelRight";
        this.mics_iframe = document.createElement("iframe");
        this.mics_iframe.id="micsiframe";
        this.mics_iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
        this.stacked_backdrop = document.createElement("div");
        this.stacked_backdrop.id = "mics_stacked_backdrop";
    (!(this.panelJson.backdropPaddingTop)&&(this.panelJson.backdropPaddingBottom))?(this.panelJson.backdropPaddingTop="0px"):(((this.panelJson.backdropPaddingTop)&&!(this.panelJson.backdropPaddingBottom))?(this.panelJson.backdropPaddingBottom="0px"):"");
    (!(this.panelJson.panelPaddingTop)&&(this.panelJson.panelPaddingBottom))?(this.panelJson.panelPaddingTop="0px"):(((this.panelJson.panelPaddingTop)&&!(this.panelJson.panelPaddingBottom))?(this.panelJson.panelPaddingBottom="0px"):"");
    this.stacked_backdrop.setAttribute("style","background:"+(this.panelJson.backdropColor||'#000')+";z-index:"+ (this.panelJson.backdropZindex||9999)+";height:"+('calc( 100vh - ('+ (this.panelJson.backdropPaddingTop + " + " + this.panelJson.backdropPaddingBottom) +'))'||'')+";top:"+(this.panelJson.backdropPaddingTop||'')+";bottom:"+(this.panelJson.backdropPaddingBottom||''));
    this.mics_iframeDiv.setAttribute("style","height:"+('calc( 100vh - ('+ (this.panelJson.panelPaddingTop + " + " + this.panelJson.panelPaddingBottom) +'))'||'')+";z-index:"+ (this.panelJson.panelZindex||99999)+";top:"+(this.panelJson.panelPaddingTop||'')+";bottom:"+(this.panelJson.panelPaddingBottom||''));
        this.stacked_backdrop.style.background=this.panelJson.backdropColor||"#000";        
        document.body.append(this.stacked_backdrop);
        document.body.append(this.mics_iframeDiv);
        this.mics_iframeDiv.append(this.mics_iframe);
        var stackedURI = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        var styleJson = this.styleJson || {};
        var handle = this;
        var loadSuccess = false;
        this.iconDisabled = true;
        var reloadTime = 5 * 60;
        var panelname=this.panelJson.panelTemplateName || "panel-template-primary";
        var reloadIFrame = function(reloadTime){
             setTimeout(function() {
                if (loadSuccess == false) {
                    handle.mics_iframe.src = handle.urlsrc || "/analytics/stacked.jsp";
                    reloadIFrame((reloadTime * 2) < 3600 ? (reloadTime * 2) : 3600);
                }
              }, reloadTime * 1000);
          }
        reloadIFrame(reloadTime);
        this.mics_iframe.onload = function(e) {
            handle.mics_iframe.contentWindow.postMessage({
                "type": "init",
                "serviceID": handle.serviceId,
                "orgID": handle.orgId,
                "url": stackedURI,
                "panelId": 1,
                "panelTemplateName": panelname,
                "styles": styleJson
              },handle.domain);
        };
  
        this.mics_iframe.src =handle.urlsrc || "/analytics/stacked.jsp";
        window.addEventListener("message", function(event, a, b) {
            if(event.data.emittype == 'messageboardMsgFromWms'){
                handle.mics_iframe.contentWindow.postMessage({ "emittype": "wmscallback", "msg": event.data.msg }, handle.domain);
            }
            if(event.data.emittype == 'messageboardServerupFromWms'){
                handle.mics_iframe.contentWindow.postMessage({ "emittype": "Bannerwmscallbackserver", "serverup": event.data.serverup }, handle.domain);
            }
            if (event.origin !=handle.domain) {
                    return;
            }
        if (event.data.panelId == 1) {
                switch (event.data.type) {
                    case "open":
                        handle.onclick(event.data);
                        break;
                    case "close":
                        handle.stacked_backdrop.click();
                        break;
                    case "start-tour":
                        //console.log("received in parent")
                        handle.startTour(event.data);
                    case "notification":
                        if (loadSuccess == false || handle.iconDisabled) {
                            handle.messagepanel_iconId.style["pointer-events"] = "all";
                            handle.messagepanel_iconId.style.opacity = "1";
                            loadSuccess = true;
                            handle.iconDisabled = false;
                            }
                        handle.updateNumber(event.data);
                        break;
                    case "save-flow":
                        
                        window.localStorage.setItem(event.data.flowID,JSON.stringify(event.data.flowdata));
                        break;
                    case "loadwalkthroughflow":
                        WalkthroughSDK.getInstance().loadFlow([event.data.flowID],'Service')
                        break;
                    case "reload":
                        loadSuccess = false;
                        handle.iconDisabled = true;
                        reloadIFrame(reloadTime);
                        handle.messagepanel_iconId.style["pointer-events"] = "none";
                        handle.messagepanel_iconId.style.opacity = this.panelJson.panelIconOpacity || "0.4";
                        break;
                  }
              }
       });
  
      this.messagepanel_iconId.addEventListener('click', function() {
                if (!handle.mics_iframe.src) {
                    handle.mics_iframe.src =handle.urlsrc || "/analytics/stacked.jsp";
                    }
          if(handle.stacked_backdrop.style.display!=='block'){
                handle.stacked_backdrop.style.display = 'block';
                handle.mics_iframeDiv.style.display = 'block';
                handle.updateNumber({
                    "value": {
                        "unviewedMessages": 0
                      }
                });
                handle.mics_iframe.contentWindow.postMessage({
                    "type": "focus"
                },handle.domain);}
          else{
        handle.stacked_backdrop.click();
          }
              });
  
      this.stacked_backdrop.addEventListener('click', function() {
                handle.stacked_backdrop.style.display = 'none';
                handle.mics_iframeDiv.style.display = 'none';
                handle.mics_iframe.contentWindow.postMessage({
                  "type": "backdrop"
                },handle.domain);
         }, false);
      
     
 
      this.updateNumber= function (data) {
            var no = data.value.unviewedMessages;
            var indicatorID=document.getElementById("stackedNumber");
            indicatorID.className=this.panelJson.messageIndicator==="number"?"micsnumber":"micsdot";
            (+no > 0)?(indicatorID.style.display = 'block') & (indicatorID.innerHTML = no):indicatorID.style.display = 'none';
            if(this.panelJson.messageIndicatorStyle){
              var indicatestyle=this.panelJson.messageIndicatorStyle;
              indicatestyle.backGround?indicatorID.style.background=indicatestyle.backGround:"";
              this.panelJson.messageIndicator==='number'?(indicatestyle.color?indicatorID.style.color=indicatestyle.color:""):"";
              indicatestyle.bottom?indicatorID.style.bottom=indicatestyle.bottom:"";
              indicatestyle.top?indicatorID.style.top=indicatestyle.top:"";
              indicatestyle.left?indicatorID.style.left=indicatestyle.left:"";
              indicatestyle.right?indicatorID.style.right=indicatestyle.right:"";
              indicatestyle.fontSize?indicatorID.style.fontSize=indicatestyle.fontSize:"";
              indicatestyle.borderRadius?indicatorID.style.borderRadius=indicatestyle.borderRadius:"";
            }
    };        
        this.onclick= function (data) {
            if(this.callback){
                return this.callback(data);
            }
            if(data.value.ctaType=='walkthrough')
            {
                this.startTour(data);
                return;
            }
            var link = data.value.cta;
            var a = document.createElement('a');                                                                                                        
            a.setAttribute("referrerpolicy", "no-referrer");
            a.href = link;
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
        },
        this.startTour=function (data) {
            WalkthroughSDK.getInstance().triggerFlow(data.value.cta,'messageboard',data.value.PID,'Service');
        }
    }
  };
/*$Id$*/
class bannersdk {
    static instance = null;
    constructor(inproductconf,orgID){
    this.inproductconf=inproductconf;
    this.orgID=orgID;
    this.serviceID=inproductconf.serviceid;
    this.url=inproductconf.inproductdomain;
    this.bannerbuffertime=3600000;
    this.wmsenabled = true;
    this.pollingenabled = true;
    this.scope="Service";
    this.verification=false;
    this.verificationcontent={};
    this.createDivforIframe();
    this.postmessagelistener= VerificationMessageListener.initialiseListener();
    this.enablemicse();
    this.helphubinitialise=null;
    this.walkthroughinitialise=null;
    this.enablemoduleconf={};
    this.setStyleforHelphubPlaceholder = function(){};
    this.setStyleforHelphubPopup = function(){};
    this.setHelphubContent = function(){};
    this.changeHelphubPlaceholder = function(){};
    this.walkthroughdynamicconfiguration={};
    this.setinsession("orgID",this.orgID);
    this.pollingverifybanner= false;
    this.lastpolltime=Date.now();
    this.setinsession("inproductconf",JSON.stringify(this.inproductconf));
    this.localstoragemanager=new bannersdklocalstoragemanager();
    this.localstoragemanager.reservespaceforORG(orgID);
    this.localstoragemanager.setCallbackListenser("micssdkstorage", this.callbackforlocalstorageupdate, this);
    }
    enablemicse() {
        this.scope = "Enterprise";
    }
    setverifydata(message) {
        //check if banner has walkthrough
        this.isWalkthroughBanner(message);
        this.setVideoConf(message);
        this.verification = true;
        this.verificationcontent = message;
        this.drawTip(message);
    }
    setinsession(key, value) {
        var micsconf = JSON.parse(sessionStorage.getItem("micsinproduct")) || {};
        micsconf[key] = value;
        sessionStorage.setItem("micsinproduct", JSON.stringify(micsconf));
    }
    getinsession(key) {
        var micsconf = JSON.parse(sessionStorage.getItem("micsinproduct")) || {};
        return micsconf[key];
    }
    setinlocal(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    getinlocal(key) {
        return this.bannersdk_parseJSON(localStorage.getItem(key));
    }   
    isWalkthroughBanner(message) {
        if (JSON.parse(message).iswalkthroughbanner) {
            this.walkthroughdynamicconfiguration = JSON.parse(message).walkthroughconf;
            this.initializewalkthrough();
        }
    }
    setVideoConf(msg) {
        let json = this.bannersdk_parseJSON(msg);
        json.videoConf ? this.enablemoduleconf.videoConf = json.videoConf : '';
    }
    setpolltimeforlonginterval(handle){
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                var lastpollingtime = this.getinlocal("micslastpolltime");
                if((Date.now() - (+lastpollingtime)) > 900000){
                    var pollingdetail={type:"bannerimmediatepoll"};
                    handle.postmessagetoiframe(pollingdetail,handle.url);
                }
            } 
          });
    }
    checkstatsinLS(handle){
        var statswithbanner = handle.localstoragemanager.getMetrics(handle.orgID);
        var statsvaluesid={"received":2,"clicked":3,"closed":4};
        if(statswithbanner.stats.length > 0){
            for(let statsvalue of statswithbanner.stats){
                handle.postmessagetoiframe( {"promotionID":statswithbanner.bannerid,"feedback":statsvaluesid[statsvalue],"scope":statswithbanner.scope},handle.url);
            }
        }
    }
    initialize(){
        bannersdk.instance = this;
        var handle=this;
        function testFlexbox () {
            var f = 'flex';
            var fw = '-webkit-flex';
            var el = document.createElement('b');
            
          try {
              el.style.display = fw;
              el.style.display = f;
              return !!(el.style.display === f || el.style.display === fw );
            } catch (err) {
                return false;
            }
        }
        function supportsCss(p) {
            var b = document.body || document.documentElement,
            s = b.style;
            
            if (typeof s[p] == 'string') { return true; }
            
            var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
            p = p.charAt(0).toUpperCase() + p.substr(1);
            
            for (var i=0; i<v.length; i++) {
                if (typeof s[v[i] + p] == 'string') { return true; }
            }
            
            return false;
        }
        function checkForMobile(){
            var isMobile = false;
            if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))){ isMobile = true;}
            return isMobile;
        }
        
        if(!testFlexbox()||checkForMobile()||!supportsCss('transition')||!supportsCss('transform')){
            return;
        }
        var delay=(new Date().getTime()-localStorage.getItem("micsnotificationtime"+handle.serviceID))<30000?5000:500; //No I18n
        localStorage.setItem("micsnotificationtime"+handle.serviceID,new Date().getTime());  //No I18n
        handle.timestamp=new Date().getTime();
        localStorage.setItem("micsTabSwitchTime",handle.timestamp);
        handle.urlsource="https://"+document.domain+"/mics";
        var tipDomain=handle.url.split('//')[1].replace("tipengine.","").split('.').reverse();
        var domainCheck=(document.domain).split('.').reverse();
        domainCheck=domainCheck.slice(0,tipDomain.length).join('')
        tipDomain=tipDomain.join('');
        if(tipDomain===domainCheck){
                handle.urlsource=handle.url;
                handle.domainType  = 'zoho';
            }
        else{
            handle.domainType  = domainCheck.includes('manageengine') ? "manageengine" : '' ;
            handle.url="https://"+document.domain;
        }
        this.timer=setInterval(function(){ handle.iframe.setAttribute("src",handle.urlsource+"/Notification?ORGID="+handle.orgID+"&ServiceID="+handle.serviceID+"&polling=true&frameorigin="+handle.domain +"&Feedback="+handle.version+"&Scope="+handle.scope); },this.failTimeout);
        setTimeout(function(){ handle.iframe.setAttribute("src",handle.urlsource+"/Notification?ORGID="+handle.orgID+"&ServiceID="+handle.serviceID+"&polling=true&frameorigin="+handle.domain +"&Feedback="+handle.version+"&Scope="+handle.scope); },delay);
            //comment1
        var bannerinlocastorage=handle.localstoragemanager.checkbannerinlocalstorage(handle.orgID);
        if(bannerinlocastorage){
            //initialize WalkthroughSDK and render Banner.
            handle.walkthroughdynamicconfiguration=handle.getWalkthroughConf();
            handle.initializewalkthrough();
            handle.drawTip(bannerinlocastorage);
        }
        handle.setinlocal('micslastpolltime',handle.lastpolltime);
        handle.setpolltimeforlonginterval(handle);
    }

    setWalkthroughConf(configuration){
        let walkthroughdynamicsconf ={};
        walkthroughdynamicsconf[this.orgID]=configuration;
        this.setinlocal('walkthroughdynamicconf',walkthroughdynamicsconf);
    }

    getWalkthroughConf(){
        let walkthroughdynamicsconf = this.getinlocal('walkthroughdynamicconf')|| {};
        return walkthroughdynamicsconf[this.orgID]|| {};

    }
    createDivforIframe(){
    this.userData={};
    this.version=3;
    var tip=this;
    if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }
    this.domain=location.origin;
    this.failTimeout=7200000;
    this.displayTimeout=220;
    this.tipDiv=document.createElement("div");
    this.tipDiv.setAttribute("id","mics_tipDiv");
    this.backdrop=document.createElement("div");
    this.backdrop.setAttribute("id","micsbackdrop"); 
    this.backdrop.setAttribute("class","micshide");
    this.iframeDiv=document.createElement("div");
    this.iframe=document.createElement("iframe");
    this.iframe.setAttribute("sandbox","allow-scripts allow-same-origin");
    this.iframeDiv.setAttribute("style","position:absolute;top:100px;left:-30005%;display:none");
    this.iframeDiv.appendChild(this.iframe);
    this.tpDiv=document.createElement("div");
    this.tpDiv.setAttribute("id","mics_tpDiv");
    this.tpDiv.setAttribute("class","micshide");  
    this.tipDiv.setAttribute("class","micshide");
    document.body.prepend(this.iframeDiv,this.tipDiv,this.backdrop,this.tpDiv);
    var handle=this;
    this.userDataString="";
    this.timestamp=new Date().getTime();
    Object.keys(this.userData).forEach(function(d){ handle.userDataString+=("&"+d+"="+handle.userData[d]);  });
    window.addEventListener("message", function(event,a,b){
        if(event.origin===handle.url){
            if(event.data&&event.data!=="None"&&event.data.type!=="tabSwitch"){
                tip.drawTip(event.data);
            }
            else if(event.data.type==="tabSwitch"){
                if(!event.data.IsActive){
                    handle.tipDiv.setAttribute("class","micshide");
                    handle.eraseBanner(handle.tipDiv);
                }                
            }
            if (typeof event.data === "string" && JSON.parse(event.data).Timeout && !(JSON.parse(event.data).PromotionID)) {
                handle.pollingenabled = false;
            }
        }
        switch (event.data.type) {
            case "buffertime":
              handle.bannerbuffertime=event.data.bannerbuffertime;
              handle.checkstatsinLS(handle);
              break;
            case "micsresize":
              Array.prototype.forEach.call(handle.tipDiv.getElementsByClassName("micsiframe"),function (d) {
              d.setAttribute("style", "width:" + event.data.width + ";height:" + event.data.height);});
              break;
            case "micsclose":
              Array.prototype.forEach.call(handle.tipDiv.getElementsByClassName("micsclose"),function (d) {
                  d.click();});
              break;
            case "micsclick":
              handle.promotionClicked();
              break;
            case "walkthroughconf":
                handle.walkthroughdynamicconfiguration = event.data.configuration;
                break;
            case "initialise":
                handle.enablemoduleconf = event.data;
                handle.initialiseinproductmodules();
              break;
            default:
          }
       if(sessionStorage.getItem("bannerverifydata")){
          handle.setverifydata(handle.bannersdk_parseJSON(sessionStorage.getItem("bannerverifydata")));
          sessionStorage.removeItem("bannerverifydata");
       }
    });
}
    initialiseinproductmodules() {
        for (let modules in this.enablemoduleconf.moduleConf) {
            if (this.enablemoduleconf.moduleConf[modules]) {
                this.modulefinder(modules);
            }
        }

    }
    modulefinder(modules) {
        switch (modules) {
            case "helphub":
                this.initializewalkthrough();
                this.initializehelphub();
                break;
            case "walkthrough":
                this.initializewalkthrough();
                break;
            default:
                break;
        }
    }
    initializehelphub() {
        var handle = this;
        handle.helphubinitialise = new selfhelpsdk(handle.inproductconf, handle.orgID);
        handle.setStyleforHelphubPlaceholder = handle.helphubinitialise.setStyleforHelphubPlaceholder;
        handle.setStyleforHelphubPopup = handle.helphubinitialise.setStyleforHelphubPopup;
        handle.setHelphubContent = handle.helphubinitialise.setHelphubContent;
        handle.changeHelphubPlaceholder = handle.helphubinitialise.changeHelphubPlaceholder;
        handle.helphubinitialise.domainConf = handle.enablemoduleconf.videoConf;
        handle.helphubinitialise.domainConf.domainType = handle.domainType;
        handle.helphubinitialise.initialize();
    };

    initializewalkthrough() {

        this.setWalkthroughConf(this.walkthroughdynamicconfiguration);
        if (WalkthroughSDK.getInstance()) {
            WalkthroughSDK.getInstance().setDynamicConf(this.walkthroughdynamicconfiguration);
            return;
        };
        this.walkthroughinitialise = new WalkthroughSDK(this.inproductconf, this.orgID);
        this.walkthroughinitialise.setDynamicConf(this.walkthroughdynamicconfiguration);
        this.walkthroughinitialise.initialize();
    };
    drawThirdParty(url,width,height,data){
        var handle=this;
        data=data?data:{};
        this.tpDiv.classList.remove("micshide");  //No I18n
        this.backdrop.classList.remove("micshide");  //No I18n
        this.backdrop.setAttribute("style",data.tpbackdropStyle?data.tpbackdropStyle:"");
        handle.eraseBanner(this.tpDiv);
        this.tpiframe=document.createElement("iframe");
        this.tpLoading=document.createElement("div");
        this.tpLoading.setAttribute("class",data.tploadingClass?data.tploadingClass:" micsloading");
        this.tpLoading.setAttribute("style",data.tploadingStyle?data.tploadingStyle:"");
        this.tpDiv.appendChild(this.tpLoading);
        this.tpDiv.appendChild(this.tpiframe);
        this.tpiframe.onload=function(){ if(handle.tpLoading.parentNode===handle.tpDiv){ handle.tpDiv.removeChild(handle.tpLoading); }  }
        this.tpiframe.setAttribute("src",url);
        this.tpiframe.setAttribute("sandbox","allow-forms allow-scripts");
        this.tpDiv.setAttribute("style",data.tpStyle?data.tpStyle:("width:"+width+"%;height:"+height+"%;top:"+(parseInt((100-height)/2))+"%;left:"+(parseInt((100-width)/2))+"%;padding:50px;"));
        this.tpiframe.setAttribute("style",data.tpiframe?data.tpiframeStyle:('width:100%;height:100%'));
        var close=document.createElement("span");close.setAttribute("class","mics_tpclx clx");
        close.setAttribute("style",data.tpcloseStyle?data.tpcloseStyle:"");
        this.tpDiv.insertBefore(close,this.tpDiv.childNodes[0]);
        close.addEventListener("click",function(){
            handle.tpDiv.setAttribute("class","micshide");
            handle.backdrop.setAttribute("class","micshide");
            handle.eraseBanner(handle.tpDiv);
        //comment2
        });
    }
    drawTip(data){
        var handle=this;
        clearInterval(handle.timer);
        var tipData1=handle.bannersdk_parseJSON(data);
        var tipData=handle.bannersdk_parseJSON(tipData1.NDETAILS);
        if(tipData1.module==='banner'){
         handle.lastpolltime=Date.now();
         handle.setinlocal('micslastpolltime',handle.lastpolltime);
         if((tipData1.PromotionID==undefined||tipData1.PromotionID==''||tipData1.PromotionID==null) && handle.localstoragemanager.checkbannerloadtimeonly(handle.orgID) && !handle.verification) {
            handle.eraseBanner(handle.tpDiv);
            handle.eraseBanner(handle.tipDiv);
            handle.localstoragemanager.dequeMessage(handle.orgID);
            return
        }
    }
        if(tipData1.PromotionID==undefined||tipData1.PromotionID==''||tipData1.PromotionID==null||handle.tipDiv.innerHTML!==""){
            //no need to enter without pid and already content in banner.
            return;
        }
        handle.pollingverifybanner=tipData.isVerification||false;
        if(!handle.verification && !handle.pollingverifybanner){
        if(!handle.localstoragemanager.getbannerloadtimeinlocalstorage(handle.orgID,tipData1.PromotionID)){
            return;
        }
	handle.localstoragemanager.enqueMessage(handle.orgID,tipData1,handle.bannerbuffertime);
        }
        handle.pid=tipData1.PromotionID;
        handle.scopeName=tipData1.scope;
        handle.zuid=tipData1.ZUID?tipData1.ZUID:0;
        if(handle.verification){ //Dev should note that => for verification checking alone
        if(handle.pid>-1){
                return;
            }
            handle.eraseBanner(handle.tipDiv);
        }
        if(this.pid===localStorage.getItem("micsnotificationid"+handle.serviceID+""+handle.scopeName) && !handle.verification){
            handle.postmessagetoiframe( {"promotionID":handle.pid,"feedback":4,"scope":handle.scopeName} ,handle.url);     //No I18n
        }
        if(this.pid===localStorage.getItem("micsnotificationid"+handle.serviceID+""+handle.scopeName)||handle.tipDiv.innerHTML!==""||!tipData.type && !handle.verification){
            return;
        }
        if(!handle.verification){
            handle.updatestatinlocalstorage("received",true,this.pid);
            this.postmessagetoiframe({"promotionID":this.pid,"feedback":2,"scope":handle.scopeName},this.url);  //No I18n
        }
        function getBgUrl(el) {
            var bg = "";
            if (el.currentStyle) { // IE
                bg = el.currentStyle.backgroundImage;
            } else if (document.defaultView && document.defaultView.getComputedStyle) { // Firefox
                bg = document.defaultView.getComputedStyle(el, "").backgroundImage;
            } else { // try and get inline style
                bg = el.style.backgroundImage;
            }
            if(bg == "none")
            {
                return "";
            }
            var backgroundUrl = bg.replace(/url\(['"]?(.*?)['"]?\)/i, "$1").split(",")[0];
            
            return backgroundUrl;
        }
        switch (tipData.type) {
            case "banner":
                handle.tipDiv.removeAttribute("style");
                handle.tipDiv.setAttribute("style", decodeURI(tipData.style));
                handle.tipDiv.setAttribute("class", tipData.className + " bannerhide");
                var test = document.createElement("img");
                test.addEventListener('load', function () { handle.drawBanner(tipData, handle, handle.pid); });
                test.addEventListener('error', function () { handle.drawBanner(tipData, handle, handle.pid); });
                test.setAttribute("src", getBgUrl(handle.tipDiv));
                break;
            case "customizedhtmlBanner":
                handle.drawCustomHTMLBanner(tipData, handle);
                break;
            case "htmlBanner":
                handle.drawHTMLBanner(tipData, handle);
                break;
            case "customwebbanner":
                handle.drawCustomHTMLBanner(tipData, handle);
                break;

            default:
                // Handle default case if needed
                break;
        }

    }
    drawCustomHTMLBanner(tipData, handle) {
        handle.promotionID = handle.pid;
        handle.scopenamefrombanner = handle.scopeName;
        handle.tipDiv.removeAttribute("style");
        handle.tipDiv.innerHTML = "";
        handle.tipDiv.classList.remove("micshide");
        var layoutDiv = document.createElement("div");
        layoutDiv.setAttribute("id", "micsshadowContainer");
        handle.tipDiv.appendChild(layoutDiv);
        var shadowdom = layoutDiv.attachShadow({ mode: "closed" });
        shadowdom.innerHTML = `<style>${tipData.css}</style>${tipData.html}`;
        if (handle.verification) {
            handle.bannerverification({ status: "deliver" });
        }
        var addMICSbannerClickListener = function (selector, callback) {
            Array.from(shadowdom.querySelectorAll(selector)).forEach(function (element) {
                var linkType = element.getAttribute("linkvalue");
                if (linkType != 'walkthrough' && linkType != 'web url') {
                    var linkType = element.getAttribute("linktype");
                }
                if (linkType == 'walkthrough') {
                    var flowID = element.getAttribute("linkvalue");
                    var WalkthroughSDKInstance = WalkthroughSDK.getInstance();
                    if (WalkthroughSDKInstance == null) {
                        return;
                    }
                    WalkthroughSDKInstance.loadFlow([flowID], handle.scopenamefrombanner);
                    element.addEventListener('click', () => {
                        handle.promotionClicked();
                        WalkthroughSDKInstance.triggerFlow(flowID, "banner", handle.promotionID, handle.scopenamefrombanner);
                    })
                }
                else {
                    element.addEventListener("click", () => callback(element));
                }
            });
        };
        addMICSbannerClickListener(".close", function () { handle.promotionClosed(); });
        addMICSbannerClickListener(".cta_button", function (ctaButton) {
            var linkValue = ctaButton.getAttribute("linktype");
            switch (linkValue) {
                case "walkthrough":
                case "web url":
                    linkValue = ctaButton.getAttribute("linkvalue");
                    break;
                case "Interactivevideo":
                case "guide":
                    var materialId = ctaButton.getAttribute("linkvalue");
                    var videoconf = handle.enablemoduleconf.videoConf;
                    var materialType = linkValue.toLowerCase();
                    var domain = "https://" + (videoconf.domain[handle.domainType] ? videoconf.domain[handle.domainType] : document.domain);
                    linkValue = domain + (handle.scopeName == "Enterprise" ? '/dap/' + materialType + '/' + videoconf.servicename + '/' + videoconf.workspaceid + '/' + materialId
                        : '/mics/' + materialType + '/' + videoconf.servicename + '/' + materialId);
                    break;
                default:
                    break;
            }
            window.open(linkValue, "_blank");
            handle.promotionClicked();
        });
        var script = document.createElement('script');
        script.innerHTML = tipData.script;
        shadowdom.appendChild(script);
        try {
            micsShadowDomReference(shadowdom);
        }
        catch (err) { }
    }
    bannersdk_parseJSON(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return {};
        }
    }
    drawHTMLBanner(tipData, handle) {
        this.promotionID = handle.pid;
        this.scopenamefrombanner = handle.scopeName;
        handle.tipDiv.removeAttribute("style");
        handle.tipDiv.innerHTML = "";
        handle.tipDiv.classList.remove("micshide");
        var layoutDiv = document.createElement("div");
        layoutDiv.setAttribute("id", "micsshadowContainer");
        handle.tipDiv.appendChild(layoutDiv);
        var shadowdom = layoutDiv;
        shadowdom = shadowdom.attachShadow({ mode: "closed" });
        shadowdom.innerHTML = "<style>" + tipData.css + "</style>" + tipData.html;
        var script = document.createElement('script');
        script.innerHTML = tipData.script;
        shadowdom.appendChild(script);
        activateScript(shadowdom);
        Array.prototype.forEach.call(shadowdom.querySelectorAll(".cta_button"), function (d) { //No I18n
            d.addEventListener("click", function (event) {
                handle.promotionClicked();
            });
        });
        Array.prototype.forEach.call(shadowdom.querySelectorAll(".close"), function (d) { //No I18n
            d.addEventListener("click", function (event) {
                handle.promotionClosed();
                clearBanner(event);
            });
        });
    }
    drawBanner(data,par,pid){
        var image=document.createElement("span");image.setAttribute("class","micsimage");
        var box=document.createElement("div");box.setAttribute("class","micsBox");
        var img=document.createElement("img");image.appendChild(img);
        var content=document.createElement("span");content.setAttribute("class","micscontent");
        var inner=document.createElement("span");inner.setAttribute("class","micsinner");
        var action=document.createElement("span");action.setAttribute("class","micsaction");
        var close=document.createElement("span");close.setAttribute("class",data.close.className?data.close.className:"micsclose");
        var toggle=document.createElement("span");toggle.setAttribute("class",data.hide.className?data.hide.className:"micstoggle");
        var iframeDiv=document.createElement("div");iframeDiv.setAttribute("class","micsiframeDiv");
        var iframe=document.createElement("iframe");iframe.setAttribute("class","micsiframe");
        iframeDiv.appendChild(iframe);
        var handle=this;
        this.promotionID=pid;
        this.scopenamefrombanner=handle.scopeName;
        this.iframeSrc = data.iframeSrc;
        toggle.addEventListener("click",function(e){
                  handle.tipDiv.classList.add("micshidden"); //No I18n
                handle.tipDiv.classList.add("micswrap"); //No I18n
                  e.stopPropagation();
                });
            handle.tipDiv.addEventListener("click",function(){
                if ( (" " + handle.tipDiv.className + " ").replace(/[\n\t]/g, " ").indexOf("micshidden") > -1 ){
                    handle.tipDiv.classList.remove("micshidden"); //No I18n
                    setTimeout(function(){   handle.tipDiv.classList.remove("micswrap");   },handle.displayTimeout);
                }
            });
            close.addEventListener("click",function(){
                if(data.iframeSrc){
                    iframe.contentWindow.postMessage( {"type":"micsClose"} ,data.iframeSrc);
                }
                handle.postmessagetoiframe( {"promotionID":pid,"feedback":4,"scope":handle.scopenamefrombanner},handle.url);  //No I18n
                handle.tipDiv.classList.add("bannerhide");
                if(handle.wmsenabled){
                    handle.pollingenabled = true;
                    handle.postmessagetoiframe({ "emittype": "Bannerwmspoll"},handle.url);
                }
          setTimeout(function(){   handle.tipDiv.classList.add("micshide"); handle.eraseBanner(handle.tipDiv);   },handle.displayTimeout);
                handle.eraseBanner(handle.tpDiv);
                handle.updatestatinlocalstorage("closed",true);
          //comment2
        });
        var pdata=this.parseData(data.content,content,inner);
        var iframeScrolling=data.iframeScrolling?data.iframeScrolling:"auto";
        iframeDiv.setAttribute("style",data.iframeDivStyle);
        iframe.setAttribute("frameborder",0);iframe.setAttribute("marginwidth",0);
        iframe.setAttribute("marginheight",0);iframe.setAttribute("scrolling",iframeScrolling);
        function loadiframe(){
            if(data.iframeSrc){
                iframe.addEventListener("load",function(){   
                    handle.tipDiv.setAttribute("class",data.className);
                    iframe.contentWindow.postMessage( {"type":"userData","zuid":handle.zuid,"orgID":handle.orgID,"userData":handle.userData,"scope":handle.scopenamefrombanner} ,data.iframeSrc);
                });
                if(data.iframesdk){
                    iframe.setAttribute("src",data.iframeSrc+((data.iframeSrc.indexOf('?')!=-1)?"&":"?")+"orgID="+handle.orgID+"&zuid="+handle.zuid+handle.userDataString);
                }
                else{
                    iframe.setAttribute("src",data.iframeSrc);
                }
            }
            else{
                iframeDiv.setAttribute("style","display:none;");
                handle.tipDiv.setAttribute("class",data.className);
            }
        }
        img.setAttribute("style", decodeURI(data.image.style));
        iframe.setAttribute("style", data.iframeStyle);
        image.setAttribute("style", decodeURI(data.imageStyle));
        box.setAttribute("style", decodeURI(data.boxStyle));
        inner.setAttribute("style", decodeURI(data.innerStyle));
        content.setAttribute("style", decodeURI(data.contentStyle));
        action.setAttribute("style", decodeURI(data.actionStyle));
        close.setAttribute("style", decodeURI(data.close.style));
        toggle.setAttribute("style", decodeURI(data.hide.style));
        action.appendChild(toggle);
        action.appendChild(close);
        handle.eraseBanner(this.tipDiv);
        box.appendChild(image);
        content.appendChild(inner);
        content.appendChild(iframeDiv);
        box.appendChild(content);
        box.appendChild(action);
        this.tipDiv.appendChild(box);
        img.addEventListener('load', function() {    loadiframe();    });
        img.addEventListener('error', function() {        loadiframe();   });
        img.setAttribute("src",data.image.src);
        Array.prototype.forEach.call(content.getElementsByClassName("micsSameLink"),function(d){ //No I18n
            d.addEventListener("click",function(){
                handle.postmessagetoiframe({"promotionID":pid,"feedback":3,"scope":handle.scopenamefrombanner},handle.url); //No I18n
                handle.drawThirdParty(this.getAttribute("url"),this.getAttribute("urlWidth"),this.getAttribute("urlHeight"),data.iframedata);
                handle.updatestatinlocalstorage("clicked",true);
            });
        });
        Array.prototype.forEach.call(content.getElementsByClassName("micsNewLink"),function(d){ //No I18n
            d.addEventListener("click",function(){
                handle.promotionClicked();
            });
        });
    }
    bannerverification(msg) {
        VerificationCompleteMessager.notifySuccess("banner", msg);
    }
    promotionClicked(){
        var handle = this;
        if(handle.verification){
            handle.bannerverification({ status: "clicked" });
            return;
        }
        handle.postmessagetoiframe({"promotionID":this.promotionID,"feedback":3,"scope":handle.scopenamefrombanner},handle.url);
        handle.updatestatinlocalstorage("clicked",true);
    }

    promotionClosed(){
        var handle = this;
        if(handle.verification){
           handle.eraseBanner(handle.tipDiv);
           handle.bannerverification({ status: "closed" });
           return;
        }
        handle.postmessagetoiframe({"promotionID":this.promotionID,"feedback":4,"scope":handle.scopenamefrombanner},handle.url); //No I18n
        handle.eraseBanner(handle.tipDiv);
        //comment2
        handle.updatestatinlocalstorage("closed",true);
    }
    parseData(data, div, inner) {
        var handle = this;
        function createElement(ele, className, dv) {
            var element = document.createElement(ele);
            element.setAttribute("class", className);
            dv.appendChild(element);
            return element;
        }
        data.forEach(function (d) {
            switch (d.type) {
                case "link": //No I18n
                    if (d.sdk) {
                        d.link = d.link + ((d.link.indexOf('?') != -1) ? "&" : "?") + "orgID=" + handle.orgID + "&zuid=" + handle.zuid + handle.userDataString;
                    }
                    if (d.check) {
                        var celem = createElement("a", "micsSameLink micslink", inner);
                        celem.setAttribute("url", d.link);
                        celem.setAttribute("urlheight", d.height ? d.height : 100);
                        celem.setAttribute("urlwidth", d.width ? d.width : 100);
                        celem.innerText = d.text;
                        celem.setAttribute("style", decodeURI(d.style));
                    }
                    else {
                        var celem = createElement("a", "micsNewLink micslink", inner);

                        if (d.flowID) {
                            WalkthroughSDK.getInstance().loadFlow(d.flowID, handle.scopenamefrombanner)

                            celem.addEventListener('click', () => { WalkthroughSDK.getInstance().triggerFlow(d.flowID, "banner", handle.promotionID, handle.scopenamefrombanner) })
                        }
                        else {
                            celem.setAttribute("href", d.link);
                            celem.setAttribute("target", "_blank");
                        }
                        celem.innerText = d.text;
                        celem.setAttribute("style", decodeURI(d.style));
                    }
                    break;
                case "desc": //No I18n
                    var celem = createElement("span", "micsdesc", inner); celem.innerText = d.text; celem.setAttribute("style", decodeURI(d.style));
                    break;
                case "header": //No I18n
                    var celem = createElement("span", "micsheader", div); celem.innerText = d.text; celem.setAttribute("style", decodeURI(d.style));
                    break;
            }
        });
    }  
    bannerstatshandler(bannerdata, instance) {
        const bannerObj = bannerdata.banner?.[instance.orgID]?.[0];
        if (!bannerObj ||(typeof bannerObj === "object" && Object.keys(bannerObj).length === 0)) {
          instance.eraseBanner(instance.tipDiv);
          return;
        } 
        const promotionID = bannerObj.data?.PromotionID;
        switch (instance.localstoragemanager.checkbannersendstats(instance.orgID, promotionID)) {
          case "load":
          case "received":
            instance.drawTip(JSON.stringify(bannerObj.data));
            break;
          case "clicked":
          case "closed":
            instance.eraseBanner(instance.tipDiv);
            break;
          default:
            break;
        }
     }
    updatestatinlocalstorage(key,value,pid=this.promotionID){
        if (document.visibilityState === 'visible' && !this.pollingverifybanner){
        this.localstoragemanager.updateMetrics(this.orgID,pid,key,value);
        }
    }
    callbackforlocalstorageupdate(updatedbanner, instance){
        instance.bannerstatshandler(updatedbanner, instance);
    }
    postmessagetoiframe(message,iframedomain){
        if (document.visibilityState === 'visible' && !this.verification){
            this.iframe.contentWindow.postMessage(message,iframedomain);
        }
    }
    eraseBanner(parent) {
        while (parent.firstChild) {
          parent.removeChild(parent.firstChild);
        }
        parent.className = 'micshide';
      }
};

//$Id$
class VerificationMessageListener {
    static listener = null;
    constructor() {
        this.inproducttypevslistenerinstance = {
            "selfhelp": SelfHelpVerificationMessageListener,
            "banner": BannerVerificationMessageListener,
            "messageboard": MessageBoardVerificationMessageListener,
            "walkthrough": WalkthroughVerificationMessageListener,
        };
        this.trustedsubdomains = ["zoho", "localzoho", "manageengine", "localmanageengine", "zohocloud", "zohonoc"];
        if (this.origincheck(document.referrer)) {
            return
        }
        this.seteventlistener();
        this.notifyReferrer();
    }

    static initialiseListener() {
        if (VerificationMessageListener.listener === null) {
            VerificationMessageListener.listener = new VerificationMessageListener();
        }
        return;
    }

    origincheck(openerurl) {
        openerurl = openerurl.split(".");
        var domainnames = ["https://mics", "https://dapnew", "https://micse", "https://micsetest", "https://dap", "https://premics", "https://predap","https://micsqa","https://dapqa","https://dapqa1","https://dapqa2","https://dapqa3","https://predaptest"]; //need an entry if domain added.
        var testdomainstartswith = "micstest";
        return !(this.trustedsubdomains.includes(openerurl[1]) && (domainnames.includes(openerurl[0]) || openerurl[0].includes(testdomainstartswith)));
    }

    seteventlistener() {
        var handle = this;
        window.addEventListener("message", function (payload) {
            if (payload.data.source === "micsinproduct" && payload.data.type != 'readytoverify' && payload.data.type != "walkthrough") {

                var inproducttype = payload.data.type.toLowerCase();    /* Type = banner/messageboard/selfhelp/walkthrough */
                var instance = handle.inproducttypevslistenerinstance[inproducttype]
                instance.processMessage(payload.data.message);
            }
        });
    }

    notifyReferrer() {
        if (document.referrer && (document.referrer.includes("mics") || document.referrer.includes("dap")) && window.opener != null) {
            window.opener.postMessage(
                { source: "micsinproductsdk", type: 'readytoverify' }, document.referrer);

        }
    }
}


class SelfHelpVerificationMessageListener {

    static processMessage(message) {
        if (selfhelpsdk.instance) {
            var sdkinstance = selfhelpsdk.instance;
            sdkinstance.setverifydata(message);
            return
        }

        sessionStorage.setItem("selfhelpverifydata", JSON.stringify(message));
    }

}

class MessageBoardVerificationMessageListener {
    static processMessage(message) {

    }
}
class WalkthroughVerificationMessageListener {
    static processMessage(message) {
        if (WalkthroughSDK.instance) {
            var sdkinstance = WalkthroughSDK.instance;
            if (message.pid === 'smarttour') {
                sdkinstance.startsmarttour(message);
                return;
            }
            sdkinstance.setverifydata(message);
            return
        }
        sessionStorage.setItem("walkthroughsdkdata", JSON.stringify(message));
    }
}
class BannerVerificationMessageListener {
    static processMessage(message) {
        if (bannersdk.instance) {
            var sdkinstance = bannersdk.instance;
            sdkinstance.setverifydata(message);
            return;
        }
        sessionStorage.setItem("bannerverifydata", JSON.stringify(message));
    }
}




class VerificationCompleteMessager {

    static notifySuccess(inproducttype, msg) {
        window.opener.postMessage({ "type": 'verify', "inproducttype": inproducttype, "source": "micsinproductsdk", "message": msg ? msg : msg = { status: "success" } }, document.referrer);
    }


}
//  $Id$
class Micssdktoserver{
    static instance=null;
    static callbackIdcounter=0;
    constructor(inproductconf, orgID) {
        this.orgID = orgID;
        this.domain = inproductconf.inproductdomain;
        this.serviceid = inproductconf.serviceid;
        this.mediumvsclass=new Map();
        this.mediumvsclass.set("banner",BannerAPI);
        this.mediumvsclass.set("messageboard",MessageboardAPI);
        this.mediumvsclass.set("walkthrough",WalkthroughAPI);
        this.mediumvsclass.set("selfhelp",SelfhelpAPI);
        this.callbacks={};
        this.apistack=[];
        this.Isinproductframeloaded=false;
        this.isCustomdomain=true;
        this.iframeWindow=this.initializeframe();
        Micssdktoserver.instance=this;
        this.inproductListener();
    }

    static getinstance(inproductconf, orgID, medium){
        if(Micssdktoserver.instance){
            return new (Micssdktoserver.instance.mediumvsclass.get((medium).toLowerCase()))();
        }
        new Micssdktoserver(inproductconf,orgID);
        return new (Micssdktoserver.instance.mediumvsclass.get((medium).toLowerCase()))();
    }

    static callApi(medium, api_type, endpoint, method, apiconfig, requestheaders, clientparams, onsuccess, onerror,async){
        let callbackId=-1;
        if(onsuccess||onerror){
            callbackId = Micssdktoserver.callbackIdcounter++;
            Micssdktoserver.instance.callbacks[callbackId] = {'onsuccess': onsuccess, 'onerror': onerror};
        }
        var params={};
        params["queryParam"]=Micssdktoserver.instance.getQueryParam(apiconfig.queryparams,clientparams);
        params["bodyParam"]=Micssdktoserver.instance.getBodyParam(apiconfig.bodyparams,clientparams);

        if(Micssdktoserver.instance.isCustomdomain){
            endpoint="/mics" + endpoint
        }

	var content={"data":{
            "medium":medium,
            "http_method":(method.toLowerCase()),
            "queryParam":params["queryParam"],
            "bodyParam":params["bodyParam"],
            "api":endpoint,
            "api_type":api_type,
            "callbackId":callbackId,
            "requestheaders":requestheaders,
            "async":async,
            "micsinproduct":true
        },"domain":Micssdktoserver.instance.domainUrl};

        if(Micssdktoserver.instance.Isinproductframeloaded){
	Micssdktoserver.makecalltoframe(content);
	}
	else{
        Micssdktoserver.instance.apistack.push(content);	
	}
    }
	
    static makecalltoframe(content){
	document.getElementById("micssdktoserverIframe").contentWindow.postMessage(content.data,content.domain);

	}


    initializeframe() {
        var self=this;
        this.domainUrl = location.origin + "/mics/jsp/inproduct.jsp?frameorigin=" + location.origin;
        var domain = this.domain.split('//')[1].replace("tipengine.", "").split('.').reverse();
        var domainCheck = (location.hostname).split('.').reverse();
        domainCheck = domainCheck.slice(0, domain.length).join('');
        domain = domain.join('');
        if (domain === domainCheck) {
            this.domainUrl = this.domain + "/jsp/inproduct.jsp?frameorigin=" + location.origin;
            this.isCustomdomain=false;
        }
        this.iframewindow = document.createElement('iframe');
        this.iframewindow.setAttribute("sandbox","allow-scripts allow-same-origin"); 
        this.iframewindow.setAttribute("src", this.domainUrl);
        this.iframewindow.setAttribute("style", "position: absolute; width:0; height:0; border:0");
        this.iframewindow.setAttribute("id", "micssdktoserverIframe");
        document.body.append(this.iframewindow);
        return this.iframewindow;
    }

    inproductListener(){
        var handle=this;
        window.addEventListener('message',(event)=>{
        let data = event.data;
        if(data.type=="inproductresponse"){
            let callback = handle.callbacks[data.callbackId];
            data.callback_type=="success"?callback.onsuccess(data.response):callback.onerror(data.response);
            delete handle.callbacks[data.callbackId];
            }
	else if(data.type=="inproductiframeload"){
	    handle.Isinproductframeloaded = true;
	    var stacklength = handle.apistack.length;
            if(stacklength){
		for(let iterator=0; iterator < stacklength; iterator++){
		 Micssdktoserver.makecalltoframe(handle.apistack[iterator]);
		}
	     handle.apistack = [];
		}	    
	}
        })
    }
        
    getQueryParam(list, params){ 
        let queryparam="";
        for (let i = 0; i < list.length; i++)
        {		 
            if(params[list[i]] == undefined) {
                continue;
            }
            queryparam+= (queryparam == "")?  ("?" + list[i] + "=" + encodeURIComponent(params[list[i]])): ("&" + list[i] + "=" + encodeURIComponent(params[list[i]]));   
        }
        return queryparam;
    }

    getBodyParam(list,params){
        let bodyparam={}
        for (let i = 0; i < list.length; i++)
        {		 
            if(params[list[i]]) {
                    bodyparam[list[i]]=params[list[i]];
                }
            }
            return bodyparam;
        }
    }
    
    class WalkthroughAPI {
        constructor(){
            this.medium="walkthrough";
            this.apiconfig={
                "metrics":{
                    "queryparams":["promotionid","orgid","sessionstarttime","stepnumber","statuscode","errorcode","serviceid","action","walkthroughid","Scope"],
                    "bodyparams":[],
                    "endpoint":"/Walkthrough",
                    "requestheaders":new Map(),
                    "async":true
                    },
                "content":{
                    "queryparams":["serviceid","orgid","action","Scope"],
                    "bodyparams":["flowidlist"],
                    "endpoint":"/Walkthrough",
                    "requestheaders":new Map(),
                    "async":true
                    },
                "verifyflow":{
                    "queryparams":["flowidlist","status","action","serviceid","orgid"],
                    "bodyparams":[],
                    "endpoint":"/Walkthrough",
                    "requestheaders":new Map(),
                    "async":true
                },        
                "meta":{
                        
                    }
            };
        }
        sendMetric(params, httpmethod, onsuccess, onerror) {
            this.triggerAPI("metrics", httpmethod, params, onsuccess, onerror);
         }
        postVerifyStatus(params, httpmethod, onsuccess, onerror){
            this.triggerAPI("verifyflow", httpmethod, params, onsuccess, onerror);
         }
         getContent(params, httpmethod, onsuccess, onerror){
            this.triggerAPI("content", httpmethod, params, onsuccess, onerror);
        }
         getMeta(params, httpmethod, onsuccess, onerror){
            this.triggerAPI("meta", httpmethod, params, onsuccess, onerror);
         }
         triggerAPI(api_type, httpmethod, params, onsuccess, onerror){
            Micssdktoserver.callApi(this.medium, api_type, this.apiconfig[api_type].endpoint, httpmethod, this.apiconfig[api_type],this.apiconfig[api_type].requestheaders, params, onsuccess, onerror, this.apiconfig[api_type].async);
         }
    }
    
    class SelfhelpAPI{
        constructor(){
            this.medium="selfhelp";
            this.apiconfig={
                "metrics":{
                    "queryparams":["serviceid","orgid", "action", "Scope"],
                    "bodyparams":[],
                    "endpoint":"/selfhelp",
                    "requestheaders":new Map(),
                    "async":true
                },
                "content":{
                },
                "meta":{
                    "queryparams":["serviceid","orgid", "action", "Scope"],
                    "bodyparams":[],
                    "endpoint":"/selfhelp",
                    "requestheaders":new Map(),
                    "async":true
		}
            }
        }
        sendMetric(params, httpmethod, onsuccess, onerror) {
            this.triggerAPI("metrics", httpmethod, params, onsuccess, onerror);
         }
         getContent(params, httpmethod, onsuccess, onerror){
            this.triggerAPI("content", httpmethod, params, onsuccess, onerror);
        }
        postVerifyStatus(params, httpmethod, onsuccess, onerror){
            this.triggerAPI("verifyflow", httpmethod, params, onsuccess, onerror);
         }
         getMeta(params, httpmethod, onsuccess, onerror){
            this.triggerAPI("meta", httpmethod, params, onsuccess, onerror);
         }
         triggerAPI(api_type, httpmethod, params, onsuccess, onerror){
            Micssdktoserver.callApi(this.medium, api_type, this.apiconfig[api_type].endpoint, httpmethod, this.apiconfig[api_type],this.apiconfig[api_type].requestheaders, params, onsuccess, onerror, this.apiconfig[api_type].async);
         }
    }
    
    class BannerAPI{
        constructor(){
            this.medium="banner";
            this.apiconfig={
                "metrics":{
                    "queryparams":["ORGID","ServiceID","polling","frameorigin","Feedback"],
                    "bodyparams":[],
                    "endpoint":"/Notification",
                    "requestheaders":new Map(),
                    "async":true
                },
                "content":{

                },
                "meta":{

                }
            }
        }
        sendMetric(params, httpmethod, onsuccess, onerror) {
            this.triggerAPI("metrics", httpmethod, params, onsuccess, onerror);
         }
         getContent(params, httpmethod, onsuccess, onerror){
            this.triggerAPI("content", httpmethod, params, onsuccess, onerror);
        }
         getMeta(params, httpmethod, onsuccess, onerror){
            this.triggerAPI("meta", httpmethod, params, onsuccess, onerror);
         }
         triggerAPI(api_type, httpmethod, params, onsuccess, onerror){
            Micssdktoserver.callApi(this.medium, api_type, this.apiconfig[api_type].endpoint, httpmethod, this.apiconfig[api_type],this.apiconfig[api_type].requestheaders, params, onsuccess, onerror, this.apiconfig[api_type].async);
        }
    }

    class MessageboardAPI{
        constructor(){
            this.medium="messageboard";
            this.apiconfig={
                "metrics":{
                },
                "content":{
                    "queryparams":["serviceId","orgId","frameorigin"],
                    "bodyparams":[],
                    "endpoint":"/Stacked",
                    "requestheaders":new Map(),
                    "async":true

                },
                "meta":{
                    
                }
            }
        }
        sendMetric(params, httpmethod, onsuccess, onerror) {
            this.triggerAPI("metrics", httpmethod, params, onsuccess, onerror);
         }
         getContent(params, httpmethod, onsuccess, onerror){
            this.triggerAPI("content", httpmethod, params, onsuccess, onerror);
        }
         getMeta(params, httpmethod, onsuccess, onerror){
            this.triggerAPI("meta", httpmethod, params, onsuccess, onerror);
         }
         triggerAPI(api_type, httpmethod, params, onsuccess, onerror){
            Micssdktoserver.callApi(this.medium, api_type, this.apiconfig[api_type].endpoint, httpmethod, this.apiconfig[api_type],this.apiconfig[api_type].requestheaders, params, onsuccess, onerror, this.apiconfig[api_type].async);
         }
    }
    
/*$Id$*/
class selfhelpsdk {
  static instance=null;
  constructor(inproduct,orgID) {
    if (selfhelpsdk.instance===null){
      selfhelpsdk.instance=this;
    }
    this.orgid=orgID;
    this.urlUtil = new PageCollection();
    this.serviceid=inproduct.serviceid;
    this.inproductconf=inproduct;
    this.micssdktoserverInstance=null;
    this.walkthroughInstance=null;
    this.customplaceholder = '';
    this.nodatahidestatus = true;
    this.indicatenodatahidestatus = false;
    this.instance=false;
    this.selftoggle = false;
    this.selfhelpmateriallist =[];
    this.searchdatalist=[];
    this.getallmaterialid=[];
    this.scope="Enterprise";
    this.stylereference={
      "backgroundcolor":"backgroundColor",
      "fontFamily":"fontFamily",
      "fontSize":"font-size",
      "fontWeight":"font-weight",
      "fontColor":"color",
      "boxShadow":"box-shadow",
      "borderTop":"border-top",
      "borderLeft":"border-left",
      "borderRight":"border-right",
      "borderBottom":"border-bottom",
      "height":"height",
      "width":"width",
      "iconColor":"color",
      "borderRadius":"borderRadius",
      "border":"border",
      "iconBackgroundcolor" : "backgroundColor"
    };
    this.selfhelpcontents={
       "indicatortext":"Help Hub",
       "popupheader":"Help Hub",
       "searchbarplaceholder":"Search for content",
       "emptylist":"Currently, no content available for this page",
       "searchnotfound":"No content found"
    };
    this.styleforDefaultplaceholder={
      "backgroundcolor":"#003297",
      "fontColor":"#ffff",
      "fontSize":"14px",
      "fontFamily":"inherit",
      "position":"right-top",
      "borderRadius":"",
      "width":"27px",
      "height":"120px",
      "logoSize":"20px"
    };
    this.styleforselfhelppopup={
      "home":{
        "backgroundcolor": "#ffffff",
        "fontFamily": "inherit",
        "boxShadow":"rgba(0, 0, 0, 0.1) 0px 0px 10px 1px"
      },
      "topband": {
        "backgroundcolor": "#003297",
        "fontColor": "#ffffff",
        "height":"45px",
        "fontSize": "14px",
        "fontFamily": "inherit",
        "fontWeight": "600",
        "boxShadow": "1px 0px 1px #bbc3ca",
        "borderBottom": "",
        "borderTop": "",
        "borderLeft": "",
        "borderRight": ""
      },
      "searchbar":{
        "iconColor":"#003297",
        "backgroundcolor":"white",
        "fontColor":"101010",
        "borderRadius":"4px",
        "border":"1px solid #9391917d",
        "iconSize":"17px"
      },
      "closebutton": {
        "iconColor": "#ffffff",
        "iconSize":"16px"
      },
      "noitem":{
        "fontColor": "#4b4b4b",
        "fontSize": "13px",
        "fontFamily": "inherit",
        "fontWeight": "300",
      },
      "listitem":{
        "fontColor": "#101010",
        "height":"",
        "fontSize": "12px",
        "fontFamily": "inherit",
        "fontWeight": "300",
        "backgroundcolor":"inherit",
        "iconColor": "#003297",
        "iconBackgroundcolor":"#0032970a",
      },
      "listitemhover":{
        "backgroundcolor":"#f0f4fb",
        "fontColor": "#101010"
      }
    },
    this.verification = false;
    this.verificationcontent={};
    this.setSelfhelpContent=this.setStyleforSelfhelpPopup=this.setStylefordefaultPlaceholder=function(){};
    this.postmessagelistener=VerificationMessageListener.initialiseListener();
    this.domainConf  = {};
  }

  enablemics(){
      this.scope="Service";
  }

  initialize() {
    var handle=this;
    handle.checkverifydata(handle);
    handle.micssdktoserverInstance=Micssdktoserver.getinstance(this.inproductconf,this.orgid,"selfhelp");
    handle.getdatacallback(handle,"Enterprise");
    if(handle.scope===!"Enterprise"){ //now only get meta for micse
          handle.getdatacallback(handle,"Service")
    }
    handle.walkthroughInstance= WalkthroughSDK.getInstance();
    handle.instance=true;
    const bodyelem = document.body;
    bodyelem.insertAdjacentHTML('beforeend', ((this.customplaceholder?'':'<div id="selfhelpicon" class='+this.styleforDefaultplaceholder.position+'><div id="micsselfhelptoggler"style=background-color:'+this.styleforDefaultplaceholder.backgroundcolor+'><svg width="20px" height="20px" id="helphublogoinwidget" viewBox="0 0 281 246" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 21C0 9.40201 9.40202 0 21 0H259.538C271.136 0 280.538 9.40202 280.538 21V192.992C280.538 204.59 271.136 213.992 259.538 213.992H21C9.40204 213.992 0 204.59 0 192.992V21ZM134.397 91.334C134.397 101.063 129.14 108.949 122.654 108.949C116.168 108.949 110.91 101.063 110.91 91.334C110.91 81.6053 116.168 73.7188 122.654 73.7188C129.14 73.7188 134.397 81.6053 134.397 91.334ZM170.281 108.949C176.766 108.949 182.024 101.063 182.024 91.334C182.024 81.6053 176.766 73.7188 170.281 73.7188C163.795 73.7188 158.537 81.6053 158.537 91.334C158.537 101.063 163.795 108.949 170.281 108.949Z" fill="white"/><path d="M143.012 242.675C141.813 244.305 139.377 244.305 138.178 242.675L113.881 209.636C112.424 207.655 113.838 204.859 116.298 204.859H164.893C167.352 204.859 168.767 207.655 167.31 209.636L143.012 242.675Z" fill="white"/></svg><span id="textself">'+this.selfhelpcontents.indicatortext+'</span></div></div>')+
      '<div id="micsselfhelpContainer" class='+this.styleforDefaultplaceholder.position+'><div id="topbar"><div id="helphublogotextcontainer"><svg width="22px" height="22px" viewBox="0 0 281 246" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 21C0 9.40201 9.40202 0 21 0H259.538C271.136 0 280.538 9.40202 280.538 21V192.992C280.538 204.59 271.136 213.992 259.538 213.992H21C9.40204 213.992 0 204.59 0 192.992V21ZM134.397 91.334C134.397 101.063 129.14 108.949 122.654 108.949C116.168 108.949 110.91 101.063 110.91 91.334C110.91 81.6053 116.168 73.7188 122.654 73.7188C129.14 73.7188 134.397 81.6053 134.397 91.334ZM170.281 108.949C176.766 108.949 182.024 101.063 182.024 91.334C182.024 81.6053 176.766 73.7188 170.281 73.7188C163.795 73.7188 158.537 81.6053 158.537 91.334C158.537 101.063 163.795 108.949 170.281 108.949Z" fill="white"/><path d="M143.012 242.675C141.813 244.305 139.377 244.305 138.178 242.675L113.881 209.636C112.424 207.655 113.838 204.859 116.298 204.859H164.893C167.352 204.859 168.767 207.655 167.31 209.636L143.012 242.675Z" fill="white"/></svg><span id="text">'+this.selfhelpcontents.popupheader+'</span></div><svg id="micsselfhelpclosableIcon"  viewBox="-3 -3 30 30" width="20" height="20"   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M18 6L6 18M6 6l12 12"></path></svg></div><div id="materiallistsearchbar" ><svg id="searchicon" fill="none" stroke="currentColor" viewBox="0 0 16 16"><path d="m14.48,12.18l-3.61-3.61s-.03-.02-.05-.03c.36-.71.58-1.49.58-2.34,0-2.87-2.33-5.2-5.2-5.2S1,3.33,1,6.2s2.33,5.2,5.2,5.2c.85,0,1.63-.22,2.34-.58.01.02.02.03.03.05l3.61,3.61c.32.32.73.47,1.15.47s.83-.16,1.15-.47c.63-.63.63-1.66,0-2.3ZM2,6.2c0-2.32,1.88-4.2,4.2-4.2s4.2,1.88,4.2,4.2-1.88,4.2-4.2,4.2-4.2-1.88-4.2-4.2Zm11.77,7.57c-.24.24-.64.24-.88,0l-3.49-3.5c.33-.26.62-.55.88-.88l3.5,3.49c.24.24.24.64,0,.88Z"></path></svg><input type="text" id="micsselfhelpsearchinput" autocomplete="off" autocorrect="off" autocapitalize="off" placeholder="'+this.selfhelpcontents.searchbarplaceholder+'"></div><div id="materiallistcontainer"></div></div>'));    
    document.getElementById('micsselfhelptoggler').addEventListener('click', this.showselfhelpPopup.bind(this));
    document.getElementById('micsselfhelpclosableIcon').addEventListener('click', this.showselfhelpPopup.bind(this));
    document.getElementById('micsselfhelpsearchinput').addEventListener('keyup', function() {
    handle.materialsearch(handle);
        });
    this.togglediv=document.getElementById('micsselfhelpContainer');
    this.addListInMaterial();
    this.urlchangeListner();
  }
  
  setStyleforHelphubPlaceholder(stylefordefaultplaceholder={}){
      this.styleforDefaultplaceholder=this.updatedefaultjson(this.styleforDefaultplaceholder,stylefordefaultplaceholder);
      if(this.instance){
        this.applyplaceholderstyles();
      }  
  }
  setStyleforHelphubPopup(styleforselfhelppopup={}){
    this.styleforselfhelppopup=this.updatedefaultjson(this.styleforselfhelppopup,styleforselfhelppopup);
    if(this.instance){
    this.applypopupstyles();
    }
  }
  setHelphubContent(selfhelpcontents={}){
    this.selfhelpcontents=this.updatedefaultjson(this.selfhelpcontents,selfhelpcontents);
  }
  
  changeHelphubPlaceholder(indicatorID){
    var handle=this;
    handle.customplaceholder= document.getElementById(indicatorID);
    handle.customplaceholder?handle.customplaceholder.addEventListener('click',function(){
        handle.showselfhelpPopup();
    }):'';
  }

  setverifydata(message){
      selfhelpsdk.instance.nodatahidestatus = message.nodatahidestatus || false;
      selfhelpsdk.instance.selfhelpmateriallist = message.meta;
      selfhelpsdk.instance.verificationcontent=message.content;
      selfhelpsdk.instance.verification  = true;
  }

   sendverifystatus(handle,msg){
  /*verifier call*/
      if(handle.verification && document.referrer && handle.selfhelpurlmatch(location.href.replace(location.origin,""),handle.selfhelpmateriallist[0].url)){
        VerificationCompleteMessager.notifySuccess("selfhelp",msg); 
      }
    }
  
  checkverifydata(handle){
      if(sessionStorage.getItem("selfhelpverifydata")){
          var sessiondata=sessionStorage.getItem("selfhelpverifydata");
          sessiondata=JSON.parse(sessiondata);
          sessionStorage.removeItem("selfhelpverifydata");
          handle.setverifydata(sessiondata);
      }
  }

  getdatacallback(handle,scope){
    handle.micssdktoserverInstance.getMeta({
    "orgid":handle.orgid,
    "serviceid":handle.serviceid,
    "action":"getTip",
    "Scope":scope
    },"get",
    function orgsuccess(xhttp){
      if(handle.verification){
        return
      }
      try{
          var parsingmeta = JSON.parse(xhttp);
          handle.nodatahidestatus = parsingmeta.nodatahidestatus;
          parsingmeta = parsingmeta.hubdata;
          handle.selfhelpmateriallist = [...handle.selfhelpmateriallist, ...parsingmeta];
	  handle.hideselfhelpforurlchange(handle);
      }
      catch(e){

      }
      return true;
    },
    function orgerror(xhttp){ 
        setTimeout(handle.initialize(),30000);
        return false;
    });
  }
  
  selfhelpurlmatch(url, pattern) { //Pattern matching algorithm

    return this.urlUtil.doesUrlPatternMatch(url, pattern);

    let urlIndex = 0;
    let patternIndex = 0;
    let lastWildcardIndex = -1;
    let backtrackUrlIndex = -1;
    let nextToWildcardIndex = -1;
    let urlLength=url.length;
    let patternLength=pattern.length;
  
    while (urlIndex < urlLength) {
    if (patternIndex < patternLength && (pattern[patternIndex] === url[urlIndex])) {
    urlIndex++;
    patternIndex++;
    } else if (patternIndex < patternLength && pattern[patternIndex] === '*') {
    lastWildcardIndex = patternIndex;
    nextToWildcardIndex = ++patternIndex;
    backtrackUrlIndex = urlIndex;
    } else if (lastWildcardIndex === -1) {
    return false;
    } else {
    patternIndex = nextToWildcardIndex;
    urlIndex = ++backtrackUrlIndex;
    }
    }
    for (let i = patternIndex; i < patternLength; i++) {
    if (pattern[i] !== '*') {
    return false;
    }
    }
    return true; 
    }

  urlchangeListner() {
        var handle = this;
        var originalPushState = history.pushState;
        var originalReplaceState = history.replaceState;
    
        history.pushState = function() {
            originalPushState.apply(history, arguments);
            handle.hideselfhelpforurlchange(handle);
        };
    
        history.replaceState = function() {
            originalReplaceState.apply(history, arguments);
            handle.hideselfhelpforurlchange(handle);
        };
    
        window.addEventListener('popstate', function(event) {
            handle.hideselfhelpforurlchange(handle);
        });
    
        window.addEventListener('hashchange', function() {
            handle.hideselfhelpforurlchange(handle);
        });
    }
    
  hideselfhelpforurlchange(handle){
    handle.addListInMaterial();
    if(!handle.selftoggle){
    return;
    }
    handle.showselfhelpPopup();
    }
  
  showselfhelpPopup() {
    this.selftoggle = !this.selftoggle;
    var setsearchempty = document.getElementById('micsselfhelpsearchinput').value;
    setsearchempty ? document.getElementById('micsselfhelpsearchinput').value='' : '';
    this.createmateriallist();
  }
 
  createmateriallist(){
    if (this.selftoggle) {
        this.addListInMaterial(); 
        this.applyplaceholderstyles();
        this.showMaterialContainerWithEffect();
        if(!this.customplaceholder){
          this.hideSelfhelpButtonwithEffect();
        }
    this.sendverifystatus(this,{status:"deliver"});
        //metric collection selfhelp click("medium")
        return '';
    }
    this.hideMaterialContainerWithEffect();
    if(!this.customplaceholder && this.indicatenodatahidestatus){
      this.showSelfhelpButtonwithEffect();
    }
  } 
 
  addListInMaterial() {
      var handle=this;
      var materiallistid = document.getElementById('materiallistcontainer');
      materiallistid.innerHTML = ('<span style="margin:auto;text-align:center;font-size:' + handle.styleforselfhelppopup.noitem.fontSize + ';font-family:' + handle.styleforselfhelppopup.noitem.fontFamily + ';font-weight:' + handle.styleforselfhelppopup.noitem.fontWeight + ';color:' + handle.styleforselfhelppopup.noitem.fontColor + '">' + handle.selfhelpcontents.emptylist + '</span>');
      var currenturl=location.href.replace(location.origin,"");
      handle.searchdatalist=[];
      handle.getallmaterialid={"Enterprise":[],"Service":[]};
      var selfhelpmanipulatedom='';
      for (var item of this.selfhelpmateriallist) {
        if(this.selfhelpurlmatch(currenturl,item.url)){
            handle.searchdatalist=[...handle.searchdatalist,...item.panellist];
            }
          }
      // if need filter the dublicate walkthrough id's here.
      if(handle.searchdatalist.length){
        materiallistid.innerHTML='';
      }
      for (var selfhelpmaterialList of handle.searchdatalist){
        for(var materialItem of selfhelpmaterialList.materiallist){
          var displayData = handle.getMaterialIconByType(materialItem.type) ;
          selfhelpmanipulatedom += '<div class="flowlist" scope="' + selfhelpmaterialList.Scope + '" panelId="' + selfhelpmaterialList.id + '" materialId="' + materialItem.id + '" materialType="' + materialItem.type + '">' +
          '<span class="materialicon">' + displayData.icon + '</span>' + '<div id="content"><span id="displayname" >' + materialItem.displayname  + '</span><span id="materialtype">' + displayData.displaytype + '</span></div>' +
          '</div>';
          if(selfhelpmaterialList.id>-1 && materialItem.type == 'walkthrough'){
            handle.getallmaterialid[selfhelpmaterialList.Scope].push(materialItem.id);             
          }
        }
      }

      if(selfhelpmanipulatedom!==''){
      handle.indicatenodatahidestatus = true;
      materiallistid.innerHTML=selfhelpmanipulatedom;
      }  
      if(selfhelpmanipulatedom === '' && handle.nodatahidestatus){
        handle.indicatenodatahidestatus = false;
        handle.hideSelfhelpButtonwithEffect();
      }

      else if (!handle.selftoggle && ((selfhelpmanipulatedom !== '' && handle.nodatahidestatus) || !handle.nodatahidestatus)) {
        handle.indicatenodatahidestatus = true;
        handle.showSelfhelpButtonwithEffect();
      }

     else if(!handle.selftoggle && !handle.nodatahidestatus){
        handle.showSelfhelpButtonwithEffect();
      }

      selfhelpmanipulatedom='';    
      handle.walkthroughInstance.loadFlow(handle.getallmaterialid["Service"],"Service");
      handle.walkthroughInstance.loadFlow(handle.getallmaterialid["Enterprise"],"Enterprise");
      handle.setdynamicstyleforlist()
      handle.addlistener(handle);
    }

    getMaterialIconByType(type) {
      switch (type) {
        case "walkthrough":
          return {icon:`<svg width="16px" height="16px" viewBox="0 0 121 118" fill="none" class="materialdesign"><circle cx="22.7955" cy="22.7955" r="17.7955" class="walkthrouhiconinnerfill" stroke-width="10"></circle><circle cx="22.7955" cy="95.2056" r="17.7955" stroke-width="10"></circle><circle cx="97.8863" cy="22.7955" r="17.7955" stroke-width="10"></circle><circle cx="97.8863" cy="95.2056" r="17.7955" stroke-width="10"></circle><line x1="42" y1="23" x2="76.8636" y2="23" stroke-width="10"></line> <line x1="43" y1="96" x2="77.8636" y2="96" stroke-width="10"></line><line x1="97" y1="76.8633" x2="97" y2="41.9996" stroke-width="10"></line></svg>`,
                  displaytype : 'Walkthrough'};
        case "Interactivevideo":
          return {icon:`<svg viewBox="0 0 122 118" fill="none" class="materialdesign"><path d="M5 76.4456V17C5 10.3726 10.3726 5 17 5H105C111.627 5 117 10.3726 117 17V76.4456C117 83.073 111.627 88.4456 105 88.4456H75.7959C73.7177 88.4456 71.721 89.2543 70.2286 90.7006L48.1613 112.085C47.4905 112.735 46.3738 112.192 46.4708 111.263L47.9304 97.2759C48.423 92.5548 44.7203 88.4456 39.9736 88.4456H17C10.3726 88.4456 5 83.073 5 76.4456Z" fill="none" stroke-width="8"></path><path fill="none" d="M48 62.6646V32.3034C48 30.8006 49.5954 29.8346 50.9271 30.5312L79.6472 45.5553C81.0709 46.3001 81.0796 48.3348 79.6622 49.0917L50.9421 64.4288C49.6099 65.1403 48 64.175 48 62.6646Z" stroke-width="8"></path></svg>`,
                  displaytype : 'Interactive Video'};
        case "guide":
          return  {icon:`<svg viewBox="0 0 16 16" class="materialdesign"><defs><style>.cls-1{stroke-width:0px;}</style></defs><path class="cls-1" d="m13.73,5.56l-3.81-4.02c-.33-.35-.79-.54-1.26-.54H3.22c-.79,0-1.43.64-1.43,1.43v11.14c0,.79.64,1.43,1.43,1.43h9.55c.79,0,1.43-.64,1.43-1.43v-6.81c0-.45-.17-.87-.48-1.2Zm-.94.46l-3-.11c-.24,0-.43-.19-.43-.45l-.11-3.18,3.54,3.74Zm-.01,7.98H3.22c-.24,0-.43-.19-.43-.43V2.43c0-.24.19-.43.43-.43h5.01l.12,3.48c0,.79.64,1.43,1.41,1.43h0l3.29.12s.01,0,.02,0c.05,0,.09-.01.13-.03v6.56c0,.24-.19.43-.43.43Z"/><path class="cls-1" d="m10.54,8.46h-4.88c-.28,0-.5.22-.5.5s.22.5.5.5h4.88c.28,0,.5-.22.5-.5s-.22-.5-.5-.5Z"/><path class="cls-1" d="m10.54,10.74h-4.88c-.28,0-.5.22-.5.5s.22.5.5.5h4.88c.28,0,.5-.22.5-.5s-.22-.5-.5-.5Z"/></svg>`,
                  displaytype : 'Guide'};
        default:
          return;
      }
    }
  
    addlistener(handle){
      var flowListElements=document.querySelectorAll('.flowlist');
      flowListElements?flowListElements.forEach(function (element) {
      element.addEventListener('click', function () {
            var panelID=element.getAttribute("panelId");
            var materialID=element.getAttribute("materialId");
            var materialType = element.getAttribute("materialType");
            var displayname = element.querySelector("#displayname").textContent;
            var scope=element.getAttribute("scope");
            handle.showselfhelpPopup();
            handle.sendverifystatus(handle,{status:"open"});
            switch (materialType) {
              case "walkthrough":
                if (panelID <= -1) {
                  let clickedverifymaterial = {};
                  clickedverifymaterial[materialID] = handle.verificationcontent[materialID];
                  handle.walkthroughInstance.datamanager.setwalkthroughData(clickedverifymaterial, scope);
                }
                handle.walkthroughInstance.triggerFlow(materialID, "selfhelp", panelID, scope); 
                break;
              case "Interactivevideo":
                handle.createIframeForInteractivevideo(handle, materialID, displayname);
                break;
              case "guide":
                var domainConf = handle.domainConf;
                var domain = "https://" + (domainConf.domain[domainConf.domainType] ? domainConf.domain[domainConf.domainType] : document.domain);
                var url = domain + (handle.scope == "Enterprise" ? '/dap/guide/' + domainConf.servicename + '/' + domainConf.workspaceid + '/' + materialID :
                  '/mics/guide/' + domainConf.servicename + '/' + materialID);
                window.open(url, "_blank");
                break;
              default:
                break;
            }
       });
     }):'';
    }

    createIframeForInteractivevideo(handle,materialID,displayname) {
      var domainConf = handle.domainConf;
      var domain =  "https://"  + ( domainConf.domain[domainConf.domainType] ?  domainConf.domain[domainConf.domainType]  : document.domain) ;
      var videoUrl = domain + (handle.scope == "Enterprise" ? '/dap/interactivevideo/' + domainConf.servicename + '/' + domainConf.workspaceid + '/' + materialID  + '?frameorigin=https://' + document.domain : 
                    '/mics/interactivevideo/' + domainConf.servicename + '/' + materialID + '?frameorigin=' +  document.domain);
      
      var iframePopupHTML = `
        <div class="iframe-popup-overlay">
          <div class="iframe-popup-container"> 
            <div id="header">
              <div id="left">         
                <svg viewBox="0 0 122 118" class="materialdesign"><path d="M5 76.4456V17C5 10.3726 10.3726 5 17 5H105C111.627 5 117 10.3726 117 17V76.4456C117 83.073 111.627 88.4456 105 88.4456H75.7959C73.7177 88.4456 71.721 89.2543 70.2286 90.7006L48.1613 112.085C47.4905 112.735 46.3738 112.192 46.4708 111.263L47.9304 97.2759C48.423 92.5548 44.7203 88.4456 39.9736 88.4456H17C10.3726 88.4456 5 83.073 5 76.4456Z" fill="none" stroke-width="8"></path><path fill="none" d="M48 62.6646V32.3034C48 30.8006 49.5954 29.8346 50.9271 30.5312L79.6472 45.5553C81.0709 46.3001 81.0796 48.3348 79.6622 49.0917L50.9421 64.4288C49.6099 65.1403 48 64.175 48 62.6646Z" stroke-width="8"></path></svg>
                <span id="text">${displayname}</span>
              </div>
              <div id="right">
                <svg id="closableIcon" viewBox="-3 -3 30 30" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </div>
            </div>
            <iframe src="${videoUrl}"></iframe>
          </div>
        </div>`;
  
      document.body.insertAdjacentHTML('beforeend', iframePopupHTML);
      document.querySelector(".iframe-popup-overlay > .iframe-popup-container > #header > #right >#closableIcon").onclick = function () {
        document.querySelector('.iframe-popup-overlay').remove();
      };
    }

    applyplaceholderstyles(){
      var micsselfhelptoggler = document.querySelector("#micsselfhelptoggler");
      micsselfhelptoggler.style[this.stylereference.backgroundcolor]=this.styleforDefaultplaceholder.backgroundcolor;
      micsselfhelptoggler.style[this.stylereference.fontColor]=this.styleforDefaultplaceholder.fontColor;
      micsselfhelptoggler.style[this.stylereference.fontSize]=this.styleforDefaultplaceholder.fontSize;
      micsselfhelptoggler.style[this.stylereference.fontFamily]=this.styleforDefaultplaceholder.fontFamily;
      micsselfhelptoggler.style[this.stylereference.borderRadius]=this.styleforDefaultplaceholder.borderRadius;
      micsselfhelptoggler.style[this.stylereference.width]=this.styleforDefaultplaceholder.width;
      micsselfhelptoggler.style[this.stylereference.height]=this.styleforDefaultplaceholder.height;
    }
    
    applypopupstyles(){
    
      var micsselfhelpContainer= document.querySelector("#micsselfhelpContainer");
      micsselfhelpContainer.style[this.stylereference.backgroundcolor]=this.styleforselfhelppopup.home.backgroundcolor;
      micsselfhelpContainer.style[this.stylereference.fontFamily]=this.styleforselfhelppopup.home.fontFamily;
      micsselfhelpContainer.style[this.stylereference.boxShadow]=this.styleforselfhelppopup.home.boxShadow;
    
      var topbar= document.querySelector("#micsselfhelpContainer > #topbar");
      topbar.style[this.stylereference.backgroundcolor]=this.styleforselfhelppopup.topband.backgroundcolor;
      topbar.style[this.stylereference.fontFamily]=this.styleforselfhelppopup.topband.fontFamily;
      topbar.style[this.stylereference.fontWeight]=this.styleforselfhelppopup.topband.fontWeight;
      topbar.style[this.stylereference.fontSize]=this.styleforselfhelppopup.topband.fontSize;
      topbar.style[this.stylereference.boxShadow]=this.styleforselfhelppopup.topband.boxShadow;
      topbar.style[this.stylereference.height]=this.styleforselfhelppopup.topband.height;
    
      var topbartext= document.querySelector("#micsselfhelpContainer > #topbar > #helphublogotextcontainer > #text");
      topbartext.style[this.stylereference.fontColor]=this.styleforselfhelppopup.topband.fontColor;
    
      var closeicon= document.querySelector("#micsselfhelpContainer > #topbar > #micsselfhelpclosableIcon");
      closeicon.style[this.stylereference.iconColor]=this.styleforselfhelppopup.closebutton.iconColor;
      closeicon.style[this.stylereference.iconSize]=this.styleforselfhelppopup.closebutton.iconSize;
    
      var searchbar= document.querySelector("#materiallistsearchbar");
      searchbar.style[this.stylereference.backgroundcolor]=this.styleforselfhelppopup.searchbar.backgroundcolor;
      searchbar.style[this.stylereference.borderRadius]=this.styleforselfhelppopup.searchbar.borderRadius;
      searchbar.style[this.stylereference.border]=this.styleforselfhelppopup.searchbar.border;
      
      var searchicon= document.querySelector("#materiallistsearchbar > #searchicon");
      searchicon.style[this.stylereference.iconSize]=this.styleforselfhelppopup.searchbar.iconSize;
      searchicon.style[this.stylereference.iconColor]=this.styleforselfhelppopup.searchbar.iconColor;
    
      var searchinput= document.querySelector("#materiallistsearchbar > #micsselfhelpsearchinput");
      searchinput.style[this.stylereference.fontColor]=this.styleforselfhelppopup.searchbar.fontColor;
      this.setdynamicstyleforlist()
    
    }
    
    setdynamicstyleforlist(){
      var listitemhover= document.querySelectorAll(".flowlist");
      var handle=this;
      listitemhover.length?listitemhover.forEach(material => {
        material.onmouseover = function() {
            material.style[handle.stylereference.backgroundcolor] = handle.styleforselfhelppopup.listitemhover.backgroundcolor;
            material.style[handle.stylereference.fontColor] = handle.styleforselfhelppopup.listitemhover.fontColor;
        };
        material.onmouseout = function() {
            material.style[handle.stylereference.backgroundcolor] = handle.styleforselfhelppopup.listitem.backgroundcolor;
            material.style[handle.stylereference.fontColor] = handle.styleforselfhelppopup.listitem.fontColor;
        };
      material.style[this.stylereference.backgroundcolor]=this.styleforselfhelppopup.listitem.backgroundcolor;
      material.style[this.stylereference.fontColor]=this.styleforselfhelppopup.listitem.fontColor;
      material.style[this.stylereference.height]=this.styleforselfhelppopup.listitem.height;
      material.style[this.stylereference.fontSize]=this.styleforselfhelppopup.listitem.fontSize;
      material.style[this.stylereference.fontFamily]=this.styleforselfhelppopup.listitem.fontFamily;
      material.style[this.stylereference.fontWeight]=this.styleforselfhelppopup.listitem.fontWeight;


      material.querySelector("#materialtype").style[this.stylereference.fontColor] = this.styleforselfhelppopup.listitem.iconColor;
      material.querySelector(".materialicon").style[this.stylereference.backgroundcolor] = this.styleforselfhelppopup.listitem.iconBackgroundcolor;
      material.querySelector(".materialdesign").style['stroke'] = this.styleforselfhelppopup.listitem.iconColor;
      material.querySelector(".materialdesign").style['fill'] = this.styleforselfhelppopup.listitem.iconColor;

      const walkthrouhiconinnerfill = material.querySelector(".walkthrouhiconinnerfill");
      if (walkthrouhiconinnerfill) {
        walkthrouhiconinnerfill.style['fill']= this.styleforselfhelppopup.listitem.iconColor;
      }
    }):"";
    }
  
  updatedefaultjson(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], this.updatedefaultjson(target[key], source[key]));
        }
    }
    Object.assign(target || {}, source);
    return target;
  }
  
  
  materialsearch(handle){
   var searchvalue=document.getElementById('micsselfhelpsearchinput').value.trim().toLowerCase();
   var selfhelpmanipulatedom='';
   if(searchvalue==='' && handle.selftoggle){
    handle.createmateriallist();
    return;
    }
    var materiallistid = document.getElementById('materiallistcontainer');
    materiallistid.innerHTML = ('<span style="margin:auto;text-align:center;font-size:' + handle.styleforselfhelppopup.noitem.fontSize + ';font-family:' + handle.styleforselfhelppopup.noitem.fontFamily + ';font-weight:' + handle.styleforselfhelppopup.noitem.fontWeight + ';color:' + handle.styleforselfhelppopup.noitem.fontColor + '">' + handle.selfhelpcontents.emptylist + '</span>');
    handle.getallmaterialid = { "Enterprise": [], "Service": [] };
    if (handle.searchdatalist.length) {
      materiallistid.innerHTML = '';
    }
   for(var selfhelpmaterialList of handle.searchdatalist){
       for(var materialItem of selfhelpmaterialList.materiallist){
            if(materialItem.displayname.toLowerCase().includes(searchvalue)){
              var displayData = handle.getMaterialIconByType(materialItem.type) ;
              selfhelpmanipulatedom += '<div class="flowlist" scope="' + selfhelpmaterialList.Scope + '" panelId="' + selfhelpmaterialList.id + '" materialId="' + materialItem.id + '" materialType="' + materialItem.type + '">' +
                '<span class="materialicon">' + displayData.icon + '</span>' + '<div id="content"><span id="displayname" >' + materialItem.displayname  + '</span><span id="materialtype">' + displayData.displaytype + '</span></div>' +
              '</div>';
              handle.getallmaterialid[selfhelpmaterialList.Scope].push(materialItem.id);
            }
       }
   }
if(selfhelpmanipulatedom!==''){
  materiallistid.innerHTML=selfhelpmanipulatedom;      }
      selfhelpmanipulatedom='';
   handle.setdynamicstyleforlist()
   if(handle.getallmaterialid["Enterprise"][0]==undefined && handle.getallmaterialid["Service"][0]==undefined){
    materiallistid.innerHTML=('<span style="margin:auto;text-align:center;font-size:'+handle.styleforselfhelppopup.noitem.fontSize+';font-family:'+handle.styleforselfhelppopup.noitem.fontFamily+';font-weight:'+handle.styleforselfhelppopup.noitem.fontWeight+';color:'+handle.styleforselfhelppopup.noitem.fontColor+'">'+handle.selfhelpcontents.searchnotfound+'</span>');
   }
      handle.addlistener(handle);
  }

  showMaterialContainerWithEffect() {
    document.getElementById("micsselfhelpContainer").style.display = 'flex';
    setTimeout(() => {
      document.getElementById("micsselfhelpContainer").classList.add("showmicsselfhelpContainer");
    }, 300);
  }

  hideMaterialContainerWithEffect() {
    document.getElementById("micsselfhelpContainer").classList.remove("showmicsselfhelpContainer");
    setTimeout(() => {
      document.getElementById("micsselfhelpContainer").style.display = 'none';
    }, 500);
  }

  showSelfhelpButtonwithEffect() {
    setTimeout(() => {
      document.getElementById("selfhelpicon").style.display = 'block';
      document.getElementById("selfhelpicon").classList.add("showselfhelpicon");
    }, 500);
  }

  hideSelfhelpButtonwithEffect() {
    document.getElementById("selfhelpicon").classList.remove("showselfhelpicon");
    setTimeout(() => {
      document.getElementById("selfhelpicon").style.display = 'none';
    }, 550);
  }
  }

/*$Id$*/
class bannersdklocalstoragemanager {
    constructor() {
        this.micssdkstorage = this.getinlocalstorage("micssdkstorage");
        this.bannerloadtimeforORG=this.getinlocalstorage("bannerloadtime");
        this.statsavailable=["received","clicked","closed"];
        if (!this.micssdkstorage) {
            this.micssdkstorage = { banner: {} };
            this.notifybanner(this.micssdkstorage);
        }
        if(!this.bannerloadtimeforORG){
            this.bannerloadtimeforORG={};
            this.setinlocalstorage("bannerloadtime",this.bannerloadtimeforORG);
        }
    }
    reservespaceforORG(orgid) {
        if (!this.micssdkstorage.banner[orgid]) {
            this.micssdkstorage.banner[orgid] = [];
            this.notifybanner(this.micssdkstorage);
        }
        return true;
    }
    notifybanner(bannerdata){
        this.setinlocalstorage("micssdkstorage", bannerdata);
    }
   checkbannerid(orgid, bannerid) {
        this.micssdkstorage = this.getinlocalstorage("micssdkstorage");
           const item = this.micssdkstorage?.banner?.[orgid]?.[0];
           if (!item) {
            return true;
            }
            if(item.data?.PromotionID === bannerid ){
                if(this.checkbannervalidation(orgid) === false){//if click or close before return false.
                    return false;
                }
            }
            return this.checkbannerexpired(orgid); //check expired
        }
    
   checkbannerexpired(orgid){
        this.bannerloadtimeforORG=this.getinlocalstorage("bannerloadtime");
            const orgData = this.bannerloadtimeforORG?.[orgid];
            const isExpired = !orgData || (Date.now() - orgData.loadedtime) >= orgData.buffertime;
            return isExpired; 
        }
   enqueMessage(orgid, banner, buffertime) {
        this.reservespaceforORG(orgid);
        if (this.checkbannerid(orgid, banner.PromotionID) && this.visibilitycheck() && this.setbannerloadtimeinlocalstorage(orgid,banner.PromotionID,buffertime)) { 
            this.micssdkstorage.banner[orgid][0] = {
                data: banner,
                received: false,
                clicked: false,
                closed: false
            };
            this.notifybanner(this.micssdkstorage);
        }
    }
    dequeMessage(orgid, bannerid) {
        if (this.visibilitycheck()) {
            this.micssdkstorage.banner[orgid][0] = {};
            this.notifybanner(this.micssdkstorage);
            return false;
        }
        return true;
        
    }
    addMetrics(orgid, bannerid, key, value, time) {
    }
    getMetrics(orgid){
        this.micssdkstorage = this.getinlocalstorage("micssdkstorage");
        const item = this.micssdkstorage.banner[orgid]?.[0];
      const statswithbannerid={"stats":[]};
        if (this.visibilitycheck() && item && item.data?.PromotionID) {
            statswithbannerid.bannerid = item.data.PromotionID;
          statswithbannerid.scope = item.data.scope;
            for(let statsvalue of this.statsavailable){
                if(item[statsvalue]){
                    statswithbannerid.stats.push(statsvalue);
                }
            }
        }
  	return statswithbannerid;
    }
    updateMetrics(orgid, bannerid, key, value) {
        this.micssdkstorage = this.getinlocalstorage("micssdkstorage");
        const item = this.micssdkstorage.banner[orgid]?.[0];
        if (this.visibilitycheck() && item && item.data?.PromotionID === bannerid ) {
            item[key] = value;
            this.notifybanner(this.micssdkstorage);
        }
    }
    setCallbackListenser(localstoragekey, callbackFunction, instance) {
        window.addEventListener("storage", (event) => {
            if (event.key === localstoragekey) {
                callbackFunction(this.parsevalue(event.newValue),instance);
            }
        });
    }
    checkbannervalidation(orgid) {
        this.micssdkstorage = this.getinlocalstorage("micssdkstorage");
        const bannertemp = this.micssdkstorage.banner[orgid]?.[0];
        if (bannertemp && bannertemp.data?.PromotionID) {
            return (!bannertemp.closed && !bannertemp.clicked);
        }
        return false;
    }
    checkbannersendstats(orgid, bannerid) {
        this.micssdkstorage = this.getinlocalstorage("micssdkstorage");
        const bannertemp = this.micssdkstorage.banner[orgid]?.[0];
        if (bannertemp && bannertemp.data?.PromotionID === bannerid) {
             return ( bannertemp.closed ? 'closed' : bannertemp.clicked ? 'clicked' : bannertemp.received ? 'received' : 'load' );
        }
        return false;
    }
    checkbannerinlocalstorage(orgid) {
        this.micssdkstorage = this.getinlocalstorage("micssdkstorage");
        const bannertemp = this.micssdkstorage.banner[orgid]?.[0];
        if (bannertemp && this.checkbannervalidation(orgid) && !this.checkbannerexpired(orgid)) {
            return this.stringifyvalue(bannertemp.data);
        }
        return null;
    }
    parsevalue(value) {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }
    stringifyvalue(value) {
        return JSON.stringify(value);
    }
    setinlocalstorage(key, value) {
        if(this.visibilitycheck){
        localStorage.setItem(key, this.stringifyvalue(value));
        }
        return;
    }
    getinlocalstorage(key) {
        return this.parsevalue(localStorage.getItem(key));
    }
    visibilitycheck(){
        return (document.visibilityState === "visible");
    }
    setbannerloadtimeinlocalstorage(orgid,bannerid,buffertime){
        this.bannerloadtimeforORG=this.getinlocalstorage("bannerloadtime");
        if(!this.visibilitycheck()){
            return false;
        }
        if(this.bannerloadtimeforORG[orgid]?.bannerid){
            if(((Date.now() - this.bannerloadtimeforORG[orgid].loadedtime ) < this.bannerloadtimeforORG[orgid].buffertime))
            {
                return false;
            }
        }
        this.bannerloadtimeforORG[orgid]={"loadedtime":Date.now(),"bannerid":bannerid,"buffertime":buffertime};
        this.setinlocalstorage("bannerloadtime",this.bannerloadtimeforORG);
        return true;
    }
  checkbannerloadtimeonly(orgid){
   let timecheck = ((Date.now() - this.bannerloadtimeforORG[orgid]?.loadedtime ) > this.bannerloadtimeforORG[orgid]?.buffertime);
         return timecheck;
  
    }
    getbannerloadtimeinlocalstorage(orgid,bannerid){
	this.bannerloadtimeforORG=this.getinlocalstorage("bannerloadtime");
        var orgcheck = this.bannerloadtimeforORG[orgid];
        var samebanner = false;
    	if(!orgcheck){
            return true;
        }
        if(this.bannerloadtimeforORG[orgid]?.bannerid === bannerid && this.checkbannervalidation(orgid)){
              samebanner =true; 
        }
        var timechecker = samebanner || this.checkbannerloadtimeonly(orgid);
        return timechecker;
    }
  }
  
// //$Id$
// class WmsCallback {
//     constructor() { }
//     handleMessages(prd, msg) {
//         if (prd == 'MI' && msg["inproduct.messages"] == 'Banner' && msg.payload && msg.payload['mics.data']) {
//             this.handleServerStatus(true, msg);
//             window.postMessage({ emittype: 'bannerMsgFromWms', msg: msg }, "*");
//         }
//         else if (msg["inproduct.messages"] == "MessageBoard" && msg.payload && msg.payload['mics.pid']) {
//             window.postMessage({ emittype: 'messageboardMsgFromWms', msg: msg }, "*");
//         }
//     }
//     handleServerStatus(isUp, msg) {
//         window.postMessage({ emittype: 'bannerServerupFromWms', "serverup": isUp }, "*");
//         window.postMessage({ emittype: 'messageboardServerupFromWms', "serverup": isUp }, "*");
//     }
//     intialize() {
//         var self = this;
//         setTimeout(function () {
//             if (typeof (WebMessanger) !== 'undefined' && (getWmsConfig() & WMSSessionConfig.CROSS_PRD) == WMSSessionConfig.CROSS_PRD) {
//                 WebMessanger.subscribeToCrossProductMessages(function (prd, msg) {
//                     self.handleMessages(prd, msg);
//                 });
//                 WebMessanger.subscribeToServerUp(function (prd, msg) {
//                     setTimeout(function () { self.handleServerStatus(true, msg); }, 10000)
//                 });
//                 WebMessanger.subscribeToServerDown(function (prd, msg) {
//                     self.handleServerStatus(false, msg);
//                 });
//             }
//             else if (typeof (WmsLite) !== 'undefined') {
//                 WmsLite.subscribeToCrossProductMessages(function (prd, msg) {
//                     self.handleMessages(prd, msg);
//                 });
//                 WmsLite.subscribeToServerUp(function (prd, msg) {
//                     setTimeout(function () { self.handleServerStatus(true, msg); }, 10000)
//                 });
//                 WmsLite.subscribeToServerDown(function (prd, msg) {
//                     self.handleServerStatus(false, msg);
//                 });
//             }
//         }, 1000);
//     }
// }
// var wms = new WmsCallback();
// wms.intialize();//$Id$

class InproductHttpCall
{
/** Extremely Important **/
/** Please refrain from using async = false. **/ 
/** Executing http calls syncronously will cause the entire page to freeze. **/
    static logger =null;

	constructor(http_method, path, headers, params, async, domain)
	{
		this.xhr = new XMLHttpRequest();
		this.http_method = http_method;
		this.domain = domain;
		this.path = this.setPath(path);
		this.headers = headers;
		this.params = params;
		this.async = async;
		this.isMicsE=false;
		this.setDefaultErrorConfiguration();
        if(InproductHttpCall.logger===null){
            InproductHttpCall.logger= InproductLogger.getInstance();
        }
	}

	setRequestBody(body) // body must be in string. We dont support FormData(), blob etc
 	{
		this.body = body;
	}
	setPath(path){
		return this.domain ?this.domain + path :sessionStorage.isbrandeddomain ? location.protocol + '//' + location.host + '/micse' + path  : location.protocol + '//' + location.host + path; // Checking the type of domain to make request respectively.
	}   
	setStaticPath(path)
       {
                this.path = path;
       }
	makeHttpRequest(onresponsecallback, onerrorcallback)
	{
		var queryparam="";	
		var self = this;
		for (let key of this.params.keys())
		{		
			queryparam+= (queryparam == "")?  (key +"="+encodeURIComponent(this.params.get(key))) : ("&"+key +"="+encodeURIComponent(this.params.get(key))) ;
		}
                this.xhr.open(this.http_method, (queryparam == "")? (this.path) : (this.path+"?"+queryparam), this.async);
		for (let key of this.headers.keys())
		{
			this.xhr.setRequestHeader(key, this.headers.get(key));
		}

		this.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		if(this.http_method == "post" || this.http_method=="Post" || this.http_method =="POST")
		{       

                        var csrfToken =this.getCSRFTokenFromCookie();   
                        var csrfParam ="iamcsrcoo";
						var orgid=this.getOrgId();
                        var forMicsE=this.getForMicsE();

			if(this.body == undefined)
			{
				this.body= "";
			}
			if(this.isMicsE==true){
			this.body+= (this.body== "")? (csrfParam+"="+csrfToken+"&orgid="+orgid+"&forMicsE="+forMicsE) : ("&"+csrfParam+"="+csrfToken+"&orgid="+orgid+"&forMicsE="+forMicsE);
			}
			else{
				this.body+= (this.body== "")? (csrfParam+"="+csrfToken) : ("&"+csrfParam+"="+csrfToken);	
			}

		}
		this.xhr.onload = () => {
            var httpStatus = this.xhr.status;
            if (self.errorConfig.HttpError[httpStatus] && self.errorConfig.HttpError[httpStatus].onError) {
                    self.errorConfig.HttpError[httpStatus].onError(this.xhr); //should pass the logger info as func also  
            }
            else if(httpStatus!=200 && httpStatus!='200'){
                InproductHttpCall.logger.log("Response Error", "medium", "error in response");
            }
            if (typeof onresponsecallback === 'function') {
                onresponsecallback(this.xhr);
            }
        };

            this.xhr.onerror = function() {
                var httpStatus = this.xhr.status;
                if (self.errorConfig[httpStatus] && self.errorConfig[httpStatus].onError) {
                    self.errorConfig[httpStatus].onError(this.xhr); //should pass the logger info as func also  
                }
                else{
                    InproductHttpCall.logger.log("Network Error", "high", "Not reachable");
                }
                if (typeof onerrorcallback === 'function') {
                onerrorcallback(this);
                }
            }
            if(this.body == undefined)
            {
                this.xhr.send();
            }
            else
            {
                this.xhr.send(this.body);
            }
	    }

        getCSRFTokenFromCookie() {
                var ca = document.cookie.split(';');
                var csr={}
                for (var i = 0; i < ca.length; i++) {
                        var c = ca[i].trim();
                        c=c.split('=');
                        csr[c[0]]=c[1]
                }
                return csr.iamcsr;
        }
        
        getOrgId(){
              var orgid=sessionStorage.getItem("orgid");
			  if(orgid==null){
				return -1
			  }
			  else{
              return orgid;
			  }
        }
        
        getForMicsE(){
              var forMicsE=sessionStorage.getItem("forMicsE");
			  if(forMicsE==null){
				return false;
			  }
              return forMicsE;
        }
         
        forMicsE(boolean){
            if(boolean==true){
            this.isMicsE=true;
                }
                else{
                    this.isMicsE=false;
                }
            }

		setCustomErrorConfiguration(errorConfig){
			this.errorConfig = errorConfig;
		}

		setCustomErrorConfigurationByType(errorConfigType,errorConfig){
			this.errorConfig[errorConfigType] = errorConfig;
		}

        setCustomOnHttpErrorConfigurationByType(key,errorConfig){
        this.errorConfig.HttpError[key]=errorConfig;
        }

		setCustomOnHttpErrorConfiguration(key,onError){
				this.errorConfig.HttpError[key].onError = onError;
		}

		setDefaultErrorConfiguration(){
			this.errorConfig = {
				NetworkError: {
					message: 'A network error occurred',
					code: 'NET_ERR',
					severity: 'high',
					retryable: true,
					onError: null  // Custom error handler
				},
				TimeoutError: {
					message: 'Request timed out',
					code: 'TIMEOUT_ERR',
					severity: 'medium',
					retryable: true,
					onError: null
				},
				HttpError: {
					'400': {
						message: 'Bad Request - Invalid input',
						code: 'BAD_REQ',
						severity: 'medium',
						retryable: false,
						onError: null
					},
					'401': {
						message: 'Unauthorized - Authentication required',
						code: 'UNAUTH',
						severity: 'high',
						retryable: false,
						onError: null
					},
					'403': {
						message: 'Forbidden - Insufficient permissions',
						code: 'FORBIDDEN',
						severity: 'high',
						retryable: false,
						onError: null
					},
					'404': {
						message: 'Not Found - Resource doesn\'t exist',
						code: 'NOT_FOUND',
						severity: 'medium',
						retryable: false,
						onError: null
					},
					'500': {
						message: 'Internal Server Error',
						code: 'SERVER_ERR',
						severity: 'critical',
						retryable: true,
						onError: null
					}
				}
			}
		}
}

//$Id$
class InproductLogger {
            static instance;
            constructor(options = {}) {
              this.logCache = {
                low: [],
                medium: [],
                high: []
              };
              this.MAX_CACHE_SIZE = options.maxCacheSize || 100;
          
            }
          
            static getInstance(options = {}) {
              if (!InproductLogger.instance) {
                InproductLogger.instance = new InproductLogger(options);
              }
              return InproductLogger.instance;
            }
            normalizeMessage(message) {
              if (message instanceof Error) {
                return `${message.name}: ${message.message}${message.stack ? `\nStack: ${message.stack}` : ''}`;
              }
              if (typeof message === 'object') {
                try {
                  return JSON.stringify(message);
                } catch {
                  return message.toString();
                }
              }
              return String(message);
            }
          
            cacheLog(severity, logEntry) {
              if (this.logCache[severity].length >= this.MAX_CACHE_SIZE) {
                this.logCache[severity].shift(); // Remove oldest entry
              }
              this.logCache[severity].push(logEntry);
            }
            log(moduleName, severity, message) {
              if (!moduleName || !severity || message === undefined) {
                throw new Error('Invalid log parameters');
              }
          
              var normalizedSeverity = severity.toLowerCase();
          
              var logEntry = {
                timestamp: new Date().toISOString(),
                moduleName,
                severity,
                message: this.normalizeMessage(message)
              };
          
              switch (normalizedSeverity) {
                case 'low':
                case 'medium':
                case 'high':
                    this.cacheLog(normalizedSeverity, logEntry);
                    break;
                default:
                  throw new Error('Invalid severity level');
              }
            }
          
            getCachedLogs(severity) {
              var normalizedSeverity = severity.toLowerCase();
              return this.logCache[normalizedSeverity] || [];
            }
            
            getAllLogs(){
                return this.logCache;
            }
          
            clearCachedLogs(severity) {
              var normalizedSeverity = severity.toLowerCase();
              this.logCache[normalizedSeverity] = [];
            }
          
            clearAllLogs() {
              Object.keys(this.logCache).forEach(severity => {
                this.logCache[severity] = [];
              });
            }
          }
        
//  $Id$
class WalkthroughLayoutManager {
    static instance = ''
    constructor() {
        this.ongoingStepLayout = ''   
    }

    createLayout(shadowdom,ongoingWalkthroughData){
        this.ongoingStepLayout = document.createElement('div');
        this.ongoingStepLayout.setAttribute("id", "walkthroughlayout");
        this.ongoingStepLayout.style.zIndex = 23657675643;
        this.ongoingStepLayout.style.position = "absolute";     
        shadowdom.shadowRoot.append(this.ongoingStepLayout);


        var style = document.createElement('style')
        var commonscript=document.createElement('script');
        commonscript.innerHTML=ongoingWalkthroughData.commonScript;


        shadowdom.shadowRoot.append(commonscript);
        style.innerHTML =ongoingWalkthroughData.commonCss;
        shadowdom.shadowRoot.append(style)
    }


    showStep(ongoingStepData) {

        let ongoingStepCssSelector = ongoingStepData.meta.targetelementID;
        let targetElement= WalkthroughUtility.getElement(ongoingStepCssSelector);
        targetElement.scrollIntoView({
            block: "center",
            inline: "nearest"
        });
        this.ongoingStepLayout.innerHTML = `<style>${ongoingStepData.css}</style>`+ongoingStepData.html;
        var script=document.createElement('script');
        script.innerHTML=ongoingStepData.script;
        this.ongoingStepLayout.append(script);
    
       this.addEventsForCurrentStep(targetElement);
       // this.observeDOMElementChange(element);

    }

    hideStep(){
        let backdrop = this.ongoingStepLayout.querySelector('.backdrop_root.Overlay');
        let layout =this.ongoingStepLayout.querySelector('[id^="layoutContainer"');
        backdrop?backdrop.querySelector('#element').style.outline="none":"";
        backdrop?backdrop.querySelector('#element').setAttribute('class','backdropBox'):"";
        layout?layout.style.display="none":"";
        

    }

    
    addEventsForCurrentStep( element){
        var buttons = this.ongoingStepLayout.querySelectorAll("#buttoncontainer");
        if (buttons) {
            buttons.forEach((buttoncontainer) => {
                var action = buttoncontainer.getAttribute('goto_action');
                var button = buttoncontainer.querySelector('button');
                //for redirecting url
                switch (action) {
                    case 'web url':
                        button.addEventListener('click', () => {
                            window.open(buttoncontainer.getAttribute('goto_action_value'), '_blank');
                        })
                        break;

                    case "NextStep":
                        button.addEventListener('click', (e) => {    
                            if (this.ongoingStepLayout.querySelectorAll('div [trigger_targetelement="true"')[0]) {
                                element.focus()
                                let event = new MouseEvent('click', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window
                                });
                                element.dispatchEvent(event);
                            }
                            WalkthroughSDK.getInstance().navigateToNextStep(e);
                        })
                        break;

                    case "PreviousStep":
                        button.addEventListener('click', () => {
                            WalkthroughSDK.getInstance().navigateToPrevStep();
                        })
                        break;

                    case "Quit":
                        button.addEventListener('click', () => {
                            WalkthroughSDK.getInstance().sendMetric({
                                'statusCode': 3
                            });
                            WalkthroughSDK.getInstance().endTour()
                        })


                }
            })
        }
    }





}//  $Id$
class WalkthroughUtility {
    constructor() {

    }
    static constructDynamicURL(flowurl, dynamicPath) {
        var regenaratorUrl = flowurl;
        var dynamicPatterns = flowurl.match(/{{(.*?)}}/g);
        if (dynamicPatterns) {
            dynamicPatterns = dynamicPatterns.map(value => value.slice(2, -2));
            dynamicPatterns.forEach(key => {
                regenaratorUrl = regenaratorUrl.replace(`{{${key}}}`, dynamicPath[key])
            });
        }
        return regenaratorUrl;
    }

    static findElement(cssID) {
        var element = WalkthroughUtility.getElement(cssID)
        if (element != null) {
            return true;
        }
        return false;
    }

    static getElementDOMObject(cssID) {
        return document.querySelector(cssID);
    }

    static logger(message, type) {
        if (!WalkthroughSDK.getInstance().debugger) return;
        switch (type) {
            case 'log':
                console.log(message)
                break

            case 'group':
                console.group(message)
                break

            case 'groupEnd':
                console.groupEnd(message)
                break

            case 'warn':
                console.warn(message)
                break

            default:
                console.log(message)
        }
    }

    static getCurrentUrlPath() {
        return window.location.href.replace(window.location.origin, '');
    }

    static removeRegexpattern(url) {
        return url.split('/*')[0]
    }

    static urlCheck(stepurl) {
        var sdkInstance = WalkthroughSDK.getInstance();
        if (stepurl.includes('*') && (sdkInstance.WalkthroughValidator.urlPatternCheck || !stepurl.includes('{{')) ) {
            return WalkthroughUtility.isUrlPatternMatch(WalkthroughUtility.getCurrentUrlPath(), stepurl);
        }
        if (WalkthroughUtility.getCurrentUrlPath() == stepurl || (sdkInstance.WalkthroughValidator.urlPatternCheck && WalkthroughUtility.isUrlPatternMatch(WalkthroughUtility.getCurrentUrlPath(), sdkInstance.ongoingStepData.meta.layoutroute))) {
            return true;
        }
        return false;
    }

    static isUrlPatternMatch(url, url_w_pattern) {
        return new PageCollection().doesUrlPatternMatch(url, url_w_pattern);

    }

    static validateDynamicURLSyntax(url) {
        let istrue = true, counter = 0;
        while (counter < 100) {
            let leftBraceIndx = url.search("{{");
            let rightBraceIndx = url.search("}}");
            //console.log("SYNTAX check: sliced url" + url);
            if (leftBraceIndx > -1 && rightBraceIndx > -1 && WalkthroughUtility.validateVariableName(url.substring(leftBraceIndx + 2, rightBraceIndx))) {
                url = url.slice(rightBraceIndx + 2, url.length);
                //console.log("SYNTAX check: sliced url" + url);
            } else if (leftBraceIndx == -1 && rightBraceIndx == -1) {
                return true;
            } else {
                return false;
            }
            counter++;
        }
    }

    static validateVariableName(name) {
        return name.match("^[^a-zA-Z_$]|[^\\w$]") == null;
    }

    static getElement(selector) {
        let selectorList = selector.split('|'),
            element = null,
            tempSelector, contextTag;
        let context = document;
        try {
            do {
                tempSelector = selectorList.shift().trim();
                element = (tempSelector != '') ? context.querySelector(tempSelector) : element;
                if (!element || selectorList.length == 0) {
                    break;
                }
                contextTag = selectorList.shift().trim().toLowerCase();
                if (contextTag == 'iframe') {
                    context = element.contentDocument;
                } else if (contextTag == 'shadowdom') {
                    context = element.shadowRoot;
                } else {
                    break;
                }
            } while (selectorList.length > 0);
        }
        catch (e) {
            return null;
        }

        return element;
    }
}

//  $Id$ 
class WalkthroughValidator {
    constructor() {
        this.urlPatternCheck = false;
    }
    postRenderValidationInterval(stepurl, cssId, ongoingStepElement) {

        let flag = -1;
        let urlValidation = WalkthroughUtility.urlCheck(stepurl);
        if (urlValidation == true) {
            WalkthroughUtility.logger("url check passed");
            var elementValidation;
            try {
                elementValidation = WalkthroughUtility.findElement(cssId);
            } catch (error) {
                elementValidation = false;
            }

            if (elementValidation == true && ongoingStepElement == WalkthroughUtility.getElement(cssId)) {
                flag = -1;
                WalkthroughUtility.logger("element check passed");
            } else if (elementValidation == true && ongoingStepElement != WalkthroughUtility.getElement(cssId)) {
                flag = 3;
            } else if (elementValidation == false) {
                flag = 2;
                WalkthroughUtility.logger("VALIDATION FAILED,Element not found,....")
                console.groupEnd();
            }

        } else {
            flag = 1;
            WalkthroughUtility.logger("VALIDATION FAILED,USER NAVIGATED!......")
        }
        return flag;

    }

    preRenderValidationInterval(stepurl, cssId) {
        let flag = -1;
        let urlValidation = WalkthroughUtility.urlCheck(stepurl);
        if (urlValidation == true) {
            WalkthroughUtility.logger("url check passed");
            let elementValidation;
            try {
                elementValidation = WalkthroughUtility.findElement(cssId);
            } catch (error) {
                flag = 2;
            }
            if (elementValidation == true) {
                WalkthroughUtility.logger("Element found");
                WalkthroughUtility.logger("VALIDATION SUCCESSFUL.....");
                console.groupEnd()
            } else {
                WalkthroughUtility.logger("element check failed");
                flag = 2;
            }
        } else {
            WalkthroughUtility.logger("url check failed");
            flag = 1;
        }
        return flag;
    }





}//  $Id$
class WalkthroughDataManager {
    constructor(serviceId, orgID) {
        this.serviceId = serviceId;
        this.orgID = orgID;
        this.dataThreshold = 20;
        this.WalkthroughData = {}
    }


    removeExistingFlowID(flowlist) {
        flowlist = flowlist.splice(0, this.dataThreshold);
        let newflowlist = []
        for (let flowid of flowlist) {
    
            if (!this.WalkthroughData[flowid]) {
                newflowlist.push(flowid)
            } else {
                this.WalkthroughData[flowid].expiryTime = new Date().getTime() + 900000
            }
        }
        return newflowlist;

    }

    optimizeData(flowlist) {
        WalkthroughUtility.logger('incoming flowlist', flowlist)
        //remove Expired Flows
        this.removeExpiredFlows()
        WalkthroughUtility.logger('after removing expried flows', this.WalkthroughData)
        let newflowlist = this.removeExistingFlowID(flowlist);
        WalkthroughUtility.logger('after removing repeated flowids', newflowlist);
        let newFlowListlen = newflowlist.length;
        let existingFlowLen = Object.keys(this.WalkthroughData).length


        //if  incoming flow list plus already present data is > greater than threshold ,remove old flows
        if (existingFlowLen + newFlowListlen >= this.dataThreshold) {
            let noofflowsToBeRemoved = Object.keys(this.WalkthroughData).length + newFlowListlen - this.dataThreshold
            this.removeAboutToExpiryFlows(noofflowsToBeRemoved)
        }

        return newflowlist;

    }

    loadFlow(flowlist,scope) {
        let self = this;

        let newflowlist = this.optimizeData(flowlist);
        if (newflowlist.length == 0) {
            return;
        }

        function onsuccess(response) {
            let data = JSON.parse(response)
            self.setwalkthroughData(data,scope)
            //window.localStorage.setItem(flowlist,JSON.stringify(data))
        }

        function onerror() {
            WalkthroughUtility.logger(response)

        }
        WalkthroughSDK.getInstance().micssdktoserver.getContent({
            'serviceid': this.serviceId,
            'action': "load",
            "orgid":this.orgID,
            "flowidlist": newflowlist,
            "Scope":scope,
        }, "post", onsuccess, onerror)
    }

    removeExpiredFlows() {
        let currTime = new Date().getTime();
        for (var flow in this.WalkthroughData) {
            let flowexpiryTime = this.WalkthroughData[flow].expiryTime
            if (flowexpiryTime < currTime) {
                delete(this.WalkthroughData[flow])
            }
        }
    }

    setwalkthroughData(data,scope){
        for (let flowid in data) {
            this.WalkthroughData[flowid] =data[flowid];
            this.WalkthroughData[flowid].expiryTime = new Date().getTime() + 900000;
            this.WalkthroughData[flowid].scope=scope
        }
    }

    removeAboutToExpiryFlows(count) {
        var sortedFlow = Object.entries(this.WalkthroughData).sort(this.compareObj);
        //delete topmost flows which has expiry time 
        for (var i = count; i > 0; i--) {
            WalkthroughUtility.logger("deleting about to expiry flows", sortedFlow[i])
            delete(this.WalkthroughData[sortedFlow[i]])
        }

    }



    loadAndTriggerFlow(flowid, medium, PID,scope) {
        let self = this;
        function onsuccess(response) {
            let data = JSON.parse(response)
            self.setwalkthroughData(data,scope)
            WalkthroughSDK.getInstance().triggerFlow(flowid, medium, PID,scope);
        }

        function onerror() {
            WalkthroughUtility.logger(response)
        }

        WalkthroughSDK.getInstance().micssdktoserver.getContent({
            'serviceid': this.serviceId,
            'action': "load",
            "orgid":this.orgID,
            "flowidlist": flowid,
            "Scope":scope,
        }, "post", onsuccess, onerror)


    }


}//  $Id$
class WalkthroughSDK {
    static instance = null;
    constructor(serviceconf, orgid, dynamicPath) {
        this.dynamicPath = sessionStorage.getItem('dynamicPath') ? JSON.parse(sessionStorage.getItem('dynamicPath')) : {};
        this.setDynamicPath(dynamicPath);
        this.serviceid = serviceconf.serviceid;
        this.orgid = orgid;
        this.inproductconf = serviceconf;
        this.tipdomain = serviceconf.inproductdomain
        this.shadowdom = null;
        this.ongoingWalkthroughData = "";
        this.ongoingStepElement = "";
        this.ongoingStepJSON = "";
        this.ongoingStepNumber;
        this.sessionStartTime;
        this.rePositionLayoutOnResizeref;
        this.rePositionLayoutOnScrollref;
        this.debugger = false;
        this.counter;
        this.flowID;
        this.urlcounter;
        this.prevalidationIntervalID = "";
        this.postvalidationIntervalID = "";
        this.micssdktoserver = Micssdktoserver.getinstance(this.inproductconf, this.orgid, "walkthrough");
        this.datamanager = new WalkthroughDataManager(this.serviceid, this.orgid);
        this.WalkthroughValidator = new WalkthroughValidator();
        this.WalkthroughLayoutManager = '';
        this.postmessagelistener = InproductMsgListener.initialiseListener();
        if (!WalkthroughSDK.instance || (this instanceof WalkthroughWrapper)) {
            WalkthroughSDK.instance = this;
        }

    }
    initialize() {
        this.checkActiveFlow() ? this.startTour(this.ongoingWalkthroughData) : ''

        if (sessionStorage.getItem("walkthroughsdkdata")) {
            var parsedverifydata = JSON.parse(sessionStorage.getItem("walkthroughsdkdata"));
            switch (parsedverifydata.action) {
                case "smarttour":
                    if (parsedverifydata.hasDynamicConf) {
                        this.setDynamicConf(parsedverifydata.walkthroughconf);
                    }
                    this.startsmarttour(parsedverifydata);
                    break;
                case "payload":
                    break;
                default:
                    this.setverifydata(parsedverifydata);
                    break;
            }
            sessionStorage.removeItem("walkthroughsdkdata");
        };
    };

    static getInstance() {
        return WalkthroughSDK.instance;
    }
    setverifydata(message) {
        this.flowID = message.materialid
        this.promotionId = message.pid
        this.datamanager.setwalkthroughData(message.data, "Service");
        this.ongoingWalkthroughData = message.data[message.materialid];
        this.startTour()
    }

    starttourbyurl(fileurl) {
        var self = this;
        var logger = InproductLogger.getInstance();
        var httpcallforjson = new InproductHttpCall('get', '', [], [], true, fileurl);
        function onsuccess(xhttp) {
            try {
                var walkthroughdataaspayload = JSON.parse(xhttp.response);
                self.startsmarttour(walkthroughdataaspayload);
            }
            catch (error) {
                logger.log("URLprovidedbyteam", "medium", "Wrong json location");
            }
        }
        function onerror(xhttp) {

        }
        httpcallforjson.makeHttpRequest(onsuccess, onerror);
    }

    startsmarttour(walkthroughconf) {
        // if(!sessionStorage.getItem("currentongoingWalkthroughDataGID")) return;
        this.flowID = Object.keys(walkthroughconf.data)[0];
        this.promotionId = walkthroughconf.pid;
        this.datamanager.setwalkthroughData(walkthroughconf.data, walkthroughconf.scope);
        this.ongoingWalkthroughData = walkthroughconf.data[this.flowID];
        this.loadTargetURL(walkthroughconf);
    }


    starttourbyurl(fileurl) {
        var self = this;
        var logger = InproductLogger.getInstance();
        var httpcallforjson = new InproductHttpCall('get', '', [], [], true, fileurl);

        function onsuccess(xhttp) {
            try {
                var walkthroughdataaspayload = JSON.parse(xhttp.response);
                self.startsmarttour(walkthroughdataaspayload);
            } catch (error) {
                logger.log("URLprovidedbyteam", "medium", "Wrong json location");
            }
        }

        function onerror(xhttp) {

        }
        httpcallforjson.makeHttpRequest(onsuccess, onerror);
    }


    loadTargetURL(walkthroughconf) {

        let flowstartingURL_pattern = window.location.origin + this.ongoingWalkthroughData.templates[0].meta.layoutroute;
        let flowstartingURL = WalkthroughUtility.constructDynamicURL(flowstartingURL_pattern, this.dynamicPath);

        let walkthroughdata = {
            flowID: this.flowID,
            PID: this.promotionId,
            scope: walkthroughconf.scope
        };
        //If user is on same url,start tour;
        if (WalkthroughUtility.urlCheck(flowstartingURL.replace(window.location.origin, ''))) {
            this.startTour();
            return;
        }
        //If "#" is present in url,route to page & start tour;
        else if (flowstartingURL.includes('#')) {
            window.location.href = WalkthroughUtility.removeRegexpattern(flowstartingURL);
            sessionStorage.setItem("currentongoingWalkthroughDataGID", JSON.stringify(walkthroughdata));
            sessionStorage.setItem(walkthroughdata.flowID, JSON.stringify(this.ongoingWalkthroughData));
            this.startTour();
            return;
        };

        sessionStorage.setItem("currentongoingWalkthroughDataGID", JSON.stringify(walkthroughdata));
        sessionStorage.setItem(walkthroughdata.flowID, JSON.stringify(this.ongoingWalkthroughData));
        //Reload page and start tour;
        window.location.href = WalkthroughUtility.removeRegexpattern(flowstartingURL);
    }

    createShadowDom() {
        this.shadowdom = document.createElement('walkthrough-builder')
        this.shadowdom.setAttribute("id", "walkthrough")
        document.body.append(this.shadowdom)
        // this.shadowdom =  this.shadowdom.attachShadow({
        //      mode: "closed"
        //  })
        this.shadowdom.attachShadow({
            mode: "open"
        })
        this.WalkthroughLayoutManager = new WalkthroughLayoutManager();
        this.WalkthroughLayoutManager.createLayout(this.shadowdom, this.ongoingWalkthroughData);
    }

    startTour() {
        WalkthroughUtility.logger("starting the tour");
        this.ongoingStepNumber = 0;
        this.ongoingStepData = this.ongoingWalkthroughData.templates[this.ongoingStepNumber];
        this.isFlowStarted = true;
        this.createShadowDom();
        WalkthroughUtility.logger(`VALIDATING STEP ${this.ongoingStepNumber + 1} .....`, 'group')
        this.sessionStartTime = new Date().getTime()

        this.WalkthroughValidator.urlPatternCheck = (this.promotionId == "-1" || this.promotionId == "0") ? true : false;
        this.validationBeforeRender();

        // this.rePositionLayoutonScrollref = this.rePositionLayoutonScroll.bind(this);
        // this.rePositionLayoutOnResizeref = this.rePositionLayoutOnResize.bind(this);
        // window.addEventListener("resize", this.rePositionLayoutOnResizeref);
        // window.addEventListener("wheel", this.rePositionLayoutonScrollref);
    }


    navigateToNextStep(event) {

        event.stopPropagation();
        WalkthroughUtility.logger('triggering next flow');
        this.sendMetric({
            'statusCode': 2
        });
        this.WalkthroughLayoutManager.hideStep();
        if (this.postvalidationIntervalID) {
            window.clearInterval(this.postvalidationIntervalID);
        }
        // this.WalkthroughLayoutManager.destroyEvents('all');
        if (this.ongoingWalkthroughData.templates.length - 1 == this.ongoingStepNumber) {
            this.endTour();
            return;
        };
        //hide prev backdrop
        // this.WalkthroughLayoutManager.hideCurrentStep()
        //this.ongoingWalkthroughData.layoutjson[this.ongoingStepNumber + 1].layoutConfig.backdrop.type == "Overlay" ? '' : this.WalkthroughLayoutManager.hideBackDrop()
        this.ongoingStepNumber++;
        WalkthroughUtility.logger(`VALIDATING STEP ${this.ongoingStepNumber + 1} .....`, 'group')
        this.ongoingStepData = this.ongoingWalkthroughData.templates[this.ongoingStepNumber];
        this.validationBeforeRender();
    }


    navigateToPrevStep() {
        // this.WalkthroughLayoutManager.destroyEvents('all');
        this.WalkthroughLayoutManager.hideStep()
        this.ongoingStepNumber--;
        this.ongoingStepData = this.ongoingWalkthroughData.templates[this.ongoingStepNumber];
        if (this.postvalidationIntervalID) {
            window.clearInterval(this.postvalidationIntervalID);
        }
        this.validationBeforeRender();
    }


    showStep() {
        this.WalkthroughLayoutManager.showStep(this.ongoingStepData)
        // this.findLayoutposition()
        this.validationAfterRender();
    }
    clearValidationInterval() {
        this.postvalidationIntervalID ? window.clearInterval(this.postvalidationIntervalID) : " "
        this.prevalidationIntervalID ? window.clearInterval(this.prevalidationIntervalID) : " "

    }

    endTour() {
        this.WalkthroughValidator.urlPatternCheck = true;
        this.clearValidationInterval();
        (this.promotionId == "-1" || this.promotionId == "0") ? ((this.ongoingWalkthroughData.templates.length - 1 == this.ongoingStepNumber) ? this.sendVerificationStatus("success") : this.sendVerificationStatus("failed")) : '';
        this.ongoingWalkthroughData = '';
        this.isFlowStarted = false;
        this.ongoingStepNumber = 0;
        this.shadowdom.remove();
        WalkthroughUtility.logger("Ending Tour");
        window.sessionStorage.removeItem("currentongoingWalkthroughDataGID")
        window.removeEventListener("resize", this.rePositionLayoutonResizeref);
        window.removeEventListener("wheel", this.rePositionLayoutonScrollref);
    }


    checkActiveFlow() {
        //for messageboard trigger and banner
        var currentFlowInfo = window.sessionStorage.getItem("currentongoingWalkthroughDataGID")
        if (currentFlowInfo == null) return false;
        let data = JSON.parse(currentFlowInfo)
        let flowid = data.flowID
        this.promotionId = data.PID
        this.flowID = flowid
        this.ongoingWalkthroughData = JSON.parse(window.sessionStorage.getItem(data.flowID));
        let ongoingwalkthrough = {};
        ongoingwalkthrough[data.flowID] = this.ongoingWalkthroughData
        this.datamanager.setwalkthroughData(ongoingwalkthrough, data.scope)
        return true;
    }

    setDynamicPath(dynamicPath) {
        for (let key in dynamicPath) {
            this.dynamicPath[key] = dynamicPath[key]
        }
        sessionStorage.setItem("dynamicPath", JSON.stringify(this.dynamicPath));
    }

    setDynamicConf(walkthroughconfig) {
        if (!walkthroughconfig.urlDynamicIdConf) return;

        walkthroughconfig.urlDynamicIdConf.forEach((data) => {
            let IDvsValue = {};
            IDvsValue[data.dynamicId] = data.properties.value;
            this.setDynamicPath(IDvsValue);
        });
    }

    validationAfterRender() {
        var self = this;
        this.counter = 0;
        this.clearValidationInterval()
        var cssId = this.ongoingStepData.meta.targetelementID;
        var stepurl = this.ongoingStepData.meta.layoutroute;
        let ongoingStepElement = WalkthroughUtility.getElement(cssId)
        stepurl = WalkthroughUtility.constructDynamicURL(stepurl, this.dynamicPath)
        this.postvalidationIntervalID = window.setInterval(() => {
            stepurl = WalkthroughUtility.constructDynamicURL(stepurl, self.dynamicPath)
            self.counter++;
            let result = self.WalkthroughValidator.postRenderValidationInterval(stepurl, cssId, ongoingStepElement);
            switch (result) {
                case -1:
                    if (self.counter > 60) {
                        var state = window.confirm("Do you want to quit the flow?");
                        if (state) {
                            window.clearInterval(self.postvalidationIntervalID);
                            self.sendMetric({
                                'statusCode': 5,
                                'errorCode': 4
                            });
                            self.endTour();
                            WalkthroughUtility.logger("VALIDATION STOPPED,QUITTED WALKTHROUGH......");
                            console.groupEnd();
                        } else {
                            self.counter = 0;
                        }
                    }
                    break;
                case 1:
                    self.sendMetric({
                        'statusCode': 5,
                        'errorCode': 3
                    });
                    self.endTour()
                    window.clearInterval(self.postvalidationIntervalID);
                    self.validateURLInterval = ''
                    break;
                case 2:

                    self.sendMetric({
                        'statusCode': 5,
                        'errorCode': 5
                    });
                    self.endTour();
                    window.clearInterval(self.postvalidationIntervalID);
                    break;
                case 3:
                    window.clearInterval(self.postvalidationIntervalID);
                    self.showStep();
                    break;
            }
            //-1 = all case passed
            //1 = url failed
            //2 = element check failed 
            //3 =  element reference failed
        }, 1000)
    }


    validationBeforeRender() {
        this.ongoingStepData = this.ongoingWalkthroughData.templates[this.ongoingStepNumber];
        var self = this;
        var stepurl = this.ongoingStepData.meta.layoutroute;
        var cssId = this.ongoingStepData.meta.targetelementID;
        this.counter = 0;
        this.urlcounter = 0;
        var regenaratorUrl = WalkthroughUtility.constructDynamicURL(stepurl, this.dynamicPath);
        this.clearValidationInterval();
        this.prevalidationIntervalID = window.setInterval(() => {
            regenaratorUrl = WalkthroughUtility.constructDynamicURL(stepurl, self.dynamicPath);
            self.counter++;
            var result = self.WalkthroughValidator.preRenderValidationInterval(regenaratorUrl, cssId);
            //-1 -Element & Url  matched ,
            //1 -> url not matched ,
            //2 -> element not found for 1 minute, so ending tour 
            switch (result) {
                case -1: {
                    self.ongoingStepElement = WalkthroughUtility.getElement(cssId);
                    self.showStep();
                    self.sendMetric({
                        'statusCode': 1
                    });
                    window.clearInterval(self.prevalidationIntervalID);
                    break;
                }
                case 1: {
                    self.urlcounter++;
                    if (self.urlcounter > 20) { //Url not matched for 5 times, so ending tour
                        self.stopIntervel(self.prevalidationIntervalID);
                        self.sendMetric({
                            'statusCode': 4,
                            'errorCode': 1
                        });
                        self.endTour();
                    }
                    break;
                }
                case 2: {
                    if (self.counter > 120) { //Element not found for 1 minute, so ending tour
                        self.sendMetric({
                            'statusCode': 4,
                            'errorCode': 2
                        });
                        self.stopIntervel(self.prevalidationIntervalID);
                        self.endTour();
                    }
                }
            }
        }, 500)
    }

    stopIntervel(intervalID) {
        window.clearInterval(intervalID);
    }

    loadFlow(flowlist, scope) {
        this.datamanager.loadFlow(flowlist, scope)
    }

    triggerFlow(flowID, medium, promotionId, scope) {
        let flowdata = this.datamanager.WalkthroughData[flowID];

        if (!flowdata) {
            this.datamanager.loadAndTriggerFlow([flowID], medium, promotionId, scope);
            return;
        }

        let existingscope = this.datamanager.WalkthroughData[flowID].scope
        if (existingscope != scope && scope != undefined) {
            this.datamanager.loadAndTriggerFlow([flowID], medium, promotionId, scope);
            return;
        }
        this.promotionId = promotionId
        var url = flowdata.templates[0].meta.layoutroute;
        url = window.location.origin + url;

        if (medium == "selfhelp" && WalkthroughUtility.isUrlPatternMatch(window.location.href, url)) {
            this.WalkthroughValidator.urlPatternCheck = true;
            this.ongoingWalkthroughData = flowdata;
            this.flowID = flowID;
            this.startTour(this.ongoingWalkthroughData);
            return;
        }
        url = WalkthroughUtility.constructDynamicURL(url, this.dynamicPath);
        var newWindow = window.open(WalkthroughUtility.removeRegexpattern(url));
        let json = {
            flowID: flowID,
            PID: promotionId,
            scope: scope
        };
        newWindow.sessionStorage.setItem("currentongoingWalkthroughDataGID", JSON.stringify(json));
        newWindow.sessionStorage.setItem(flowID, JSON.stringify(flowdata));
    }

    sendMetric(data) {
        let metric = {
            'action': "metrics",
            'walkthroughid': this.flowID,
            'promotionid': this.promotionId,
            'orgid': this.orgid,
            'sessionstarttime': this.sessionStartTime,
            'stepnumber': this.ongoingStepNumber + 1,
            'statuscode': data.statusCode,
            'errorcode': data.errorCode ? data.errorCode : undefined,
            'serviceid': this.serviceid,
            'Scope': this.datamanager.WalkthroughData[this.flowID].scope
        }


        if (this.promotionId != "-1" && this.promotionId != "0") {
            this.micssdktoserver.sendMetric(metric, "post", () => { }, () => { });
        }


    }

    sendVerificationStatus(status) {
        let param = {
            "flowidlist": [this.flowID],
            "action": "updateWalkthroughStatus",
            "serviceid": this.serviceid,
            "orgid": this.orgid,
            "status": "Verified"

        }

        // function onsuccess() {
        let type = "verify";
        if (this.promotionId == 0) {
            type = "preview";
        }

        window.opener ? window.opener.postMessage({ WalkthroughCallback: true, type: type, status: status }, "*") : ""


    }
}
/* $Id$ */

//Check if PageCollection is already declared;

if (!globalThis.PageCollection) {

    class PageCollection {

        // AbsoluteUrl - complete and valid url
        // RelativeUrl - parts excluding the base url

        constructor(serviceUrlOrigin, urlDynamicIdConf, pageList) {
            this.urlDynamicIdConf = (urlDynamicIdConf) ? urlDynamicIdConf : [];
            this.serviceUrlOrigin = serviceUrlOrigin;
            this.pageListData = pageList ? pageList : [];
            this.urlRegexRef = {
                search: /\?[^#]*/,
                hash: /#[^#\/\?]*$/,
                hashPath: /#.*/,
            };
        }

        addPage(name, link) {
            this.pages.push({ name, link });
        }

        setPageListData(pageList) {
            this.pageListData = pageList;
        }

        constructAbsoluteUrl(relativeUrl, urlOrigin = this.serviceUrlOrigin) {
            if (this.isLinkValid(relativeUrl)) {
                let url = new URL(relativeUrl);
                relativeUrl = relativeUrl.replace(url.origin, '');
                return this.parseCustomUrlObj(urlOrigin + relativeUrl);
            }
            return this.parseCustomUrlObj(urlOrigin + relativeUrl);
        }

        listPages() {
            return JSON.parse(JSON.stringify(this.pages));
        }

        doesUrlPatternMatch(url, urlPattern) {
            let urlObj = this.parseCustomUrlObj(this.serviceUrlOrigin + url);
            let urlPatternObj = this.parseCustomUrlObj(this.serviceUrlOrigin + urlPattern);

            let splittedUrl = this.splitUrlAsSingleArray(urlObj);
            let splittedPattern = this.splitUrlAsSingleArray(urlPatternObj);

            if (splittedUrl.length === splittedPattern.length
                && ((urlObj.hashPath && urlPatternObj.hashPath && urlObj.hashPathArr.length == urlPatternObj.hashPathArr.length) || (!urlObj.hashPath && !urlPatternObj.hashPath))
                && ((urlObj.search && urlPatternObj.search) || (!urlObj.search && !urlPatternObj.search))
                && ((urlObj.hash && urlPatternObj.hash) || (!urlObj.hash && !urlPatternObj.hash))) {
                for (let i = 0; i < splittedUrl.length; i++) {
                    if (splittedPattern[i] !== splittedUrl[i] && !(this.isDynamicSegment(splittedPattern[i]) && splittedUrl[i] != '')) {
                        return false;
                    }
                }
                return true;
            }

            return false;
        }

        isDynamicSegment(segment) {
            return /^(\{\{.*?\}\}|\*)$/.test(segment);
        }

        doesPageNameExist(pageName) {
            return this.pageListData.some((page) => {
                return page.name.toLowerCase() === pageName.toLowerCase();
            });
        }

        isLinkConfigurationExist(pagePath) {
            return this.pageListData.some((page) => {
                return this.doesUrlPatternMatch(pagePath, page.link);
            });
        }

        parseCustomUrlObj(link) {
            if (this.isLinkValid(link)) {
                let url = new URL(link);
                link = link.replace(url.origin, '');
            }
            let constructedObj = {};
            constructedObj.origin = this.serviceUrlOrigin ? this.serviceUrlOrigin : '';
            constructedObj.href = constructedObj.origin + link;
            constructedObj.fullPath = link;
            constructedObj.actualPath = constructedObj.fullPath;
            if (constructedObj.fullPath.match(this.urlRegexRef.search) != null) {
                constructedObj.search = constructedObj.fullPath.match(this.urlRegexRef.search)[0];
                constructedObj.searchArr = constructedObj.search.slice(1).split("&");
                constructedObj.actualPath = constructedObj.actualPath.replace(constructedObj.search, '');
            }
            if (constructedObj.fullPath.match(this.urlRegexRef.hash) != null) {
                constructedObj.hash = constructedObj.fullPath.match(this.urlRegexRef.hash)[0];
                constructedObj.hashVal = constructedObj.hash.slice(1);
                constructedObj.actualPath = constructedObj.actualPath.replace(this.urlRegexRef.hash, '');
            }
            if (constructedObj.actualPath.match(this.urlRegexRef.hashPath) != null) {
                constructedObj.hashPath = constructedObj.actualPath.match(this.urlRegexRef.hashPath)[0];
                constructedObj.hashPathArr = constructedObj.hashPath.slice(1).split('/');
                constructedObj.actualPath = constructedObj.actualPath.replace(constructedObj.hashPath, '');
            }
            constructedObj.pathArr = constructedObj.actualPath.split('/');
            return constructedObj;
        }

        replaceUrlDynamicId(urlObj, urlDynamicIdConf) {
            urlDynamicIdConf = urlDynamicIdConf || this.urlDynamicIdConf;
            let validArrJson = {
                pathArr: urlObj.pathArr.filter(x => x != ''),
                hashPathArr: urlObj.hashPath ? urlObj.hashPathArr.filter(x => x != '') : [],
            },
                newUrlObj = JSON.parse(JSON.stringify(urlObj));
            if (urlDynamicIdConf && urlDynamicIdConf.length > 0) {
                urlDynamicIdConf.forEach((conf) => {
                    if (conf.position - 1 < validArrJson.pathArr.length) {
                        newUrlObj = this.markWildcardInUrl(newUrlObj, 'path', conf.position - 1, `{{${conf.dynamicId}}}`);
                    } else if (conf.position - 1 < validArrJson.hashPathArr.length) {
                        newUrlObj = this.markWildcardInUrl(newUrlObj, 'hashPath', conf.position - 1, `{{${conf.dynamicId}}}`);
                    }
                });
            }
            return newUrlObj;
        }

        markWildcardInUrl(urlObj, urlKey, validIndexPos, markWith = "*") {
            let newUrlObj = JSON.parse(JSON.stringify(urlObj)),
                validIndex = -1;
            switch (urlKey) {
                case "path":
                    for (let i = 0; i < urlObj.pathArr.length; i++) {
                        (newUrlObj.pathArr[i] != "") ? validIndex++ : '';
                        if (validIndex == validIndexPos) {
                            newUrlObj.pathArr[i] = markWith;
                            break;
                        }
                    }
                    newUrlObj.actualPath = newUrlObj.pathArr.join("/");
                    break;
                case "hashPath":
                    for (let i = 0; i < urlObj.hashPathArr.length; i++) {
                        (newUrlObj.hashPathArr[i] != "") ? validIndex++ : '';
                        if (validIndex == validIndexPos) {
                            newUrlObj.hashPathArr[i] = markWith;
                            break;
                        }
                    }
                    newUrlObj.hashPath = '#' + newUrlObj.hashPathArr.join("/");
                    break;
                case "search":
                    for (let i = 0; i < urlObj.searchArr.length; i++) {
                        (newUrlObj.searchArr[i] != "") ? validIndex++ : '';
                        if (validIndex == validIndexPos) {
                            newUrlObj.searchArr[i] = markWith;
                            break;
                        }
                    }
                    newUrlObj.search = "?" + newUrlObj.searchArr.join("&");
                    break;
                case "hash":
                    newUrlObj.hash = "#" + markWith;
                    newUrlObj.hashVal = markWith;
                    break;
            }
            newUrlObj.fullPath = newUrlObj.actualPath + (newUrlObj.hashPath || '') + (newUrlObj.search || '') + (newUrlObj.hash || '');
            newUrlObj.href = newUrlObj.origin + newUrlObj.fullPath;
            return newUrlObj;
        }

        isLinkValid(link) {
            try {
                let url = new URL(link);
                return url;
            } catch (e) {
                return false;
            }
        }

        constructDynamicURL(flowurl, urlDynamicIdConf) {
            if (urlDynamicIdConf && urlDynamicIdConf.length == 0) return flowurl;
            urlDynamicIdConf = urlDynamicIdConf ? urlDynamicIdConf : this.urlDynamicIdConf;
            var url = flowurl;
            var dynamicPatterns = flowurl.match(/\{\{.*?\}\}/g);
            if (dynamicPatterns) {
                dynamicPatterns = dynamicPatterns.map(value => value.slice(2, -2));
                dynamicPatterns.forEach(key => {
                    let dynamicId = urlDynamicIdConf.find(x => x.dynamicId == key);
                    (dynamicId && dynamicId.properties && dynamicId.properties.value) ? url = url.replace(`{{${key}}}`, dynamicId.properties.value) : '';
                });
            }
            return url;
        }

        getContructedBaseUrl(materialConfData) {
            let baseUrl = materialConfData.baseUrl[0].value;
            (materialConfData.urlDynamicIdConf && materialConfData.urlDynamicIdConf.length != 0) ? baseUrl = this.constructDynamicURL(materialConfData.baseUrl[0].value, materialConfData.urlDynamicIdConf) : '';
            return baseUrl;
        }

        getMatchingUrlFromExisting(url, pageList, builderQuery) {
            pageList = pageList ? pageList : this.pageListData;
            let urlList = [];

            if (pageList && pageList.length > 0) {
                urlList = urlList.concat(pageList.filter(x => x.type.trim().toLowerCase() === "regex").map(x => x.link));
            }
            if (builderQuery && builderQuery.layoutList.length > 0) {
                urlList = urlList.concat(builderQuery.layoutList.map(x => x.layoutroute));
            }

            let combinedUrl = (urlList.length > 0) ? this.syncWildcardFromList(url, urlList) : url;
            if (combinedUrl === url) {
                let customUrlObj = this.constructAbsoluteUrl(url);
                customUrlObj = this.replaceUrlDynamicId(customUrlObj);
                combinedUrl = customUrlObj.fullPath;
            }
            return combinedUrl;
        }

        syncWildcardFromList(url, urlPatternList) {
            urlPatternList = urlPatternList ? urlPatternList : this.pageListData.filter(x => x.type.trim().toLowerCase() === "regex").map(x => x.link);
            let maxMatchedUrl, combinedUrlPattern = url;

            for (let i = 0; i < urlPatternList.length; i++) {
                let urlMatchObj = this.getUrlPatternMatchObj(url, urlPatternList[i]);
                if (urlMatchObj.isFullyMatched) {
                    return urlPatternList[i];
                }
                urlMatchObj.listIndex = i;

                maxMatchedUrl = (urlMatchObj.matchedValidPartsLen > 0 && !maxMatchedUrl)
                    || (maxMatchedUrl && urlMatchObj.matchedValidPartsLen > maxMatchedUrl.matchedValidPartsLen) ? urlMatchObj : maxMatchedUrl;
            }

            if (maxMatchedUrl && maxMatchedUrl.wildcardMatchLen > 0) {
                let urlObj = this.parseCustomUrlObj(this.serviceUrlOrigin + url),
                    urlPatternObj = this.parseCustomUrlObj(this.serviceUrlOrigin + urlPatternList[maxMatchedUrl.listIndex]),
                    splittedPattern = this.splitUrlAsSingleValidArray(urlPatternObj),
                    actualPathMaxPos = urlObj.pathArr.filter(x => x != '').length - 1,
                    hashPathMaxPos = actualPathMaxPos + ( urlObj.hashPath ? urlObj.hashPathArr.filter(x => x != '').length - 1 : 0),
                    searchMaxPos = hashPathMaxPos + (urlObj.search ? urlObj.searchArr.filter(x => x != '').length - 1 : 0);

                for (let i = 0; i < maxMatchedUrl.matchedValidPartsLen; i++) {
                    if (/^(\*)$/.test(splittedPattern[i])) {
                        if (i <= actualPathMaxPos) {
                            urlObj = this.markWildcardInUrl(urlObj, "path", i, splittedPattern[i]);
                        } else if (i > actualPathMaxPos && i <= hashPathMaxPos ) {
                            urlObj = this.markWildcardInUrl(urlObj, "hashPath", i - actualPathMaxPos, splittedPattern[i]);
                        } else if (i > hashPathMaxPos && i <= searchMaxPos) {
                            urlObj = this.markWildcardInUrl(urlObj, "search", (i - actualPathMaxPos - hashPathMaxPos), splittedPattern[i]);
                        } else {
                            urlObj = this.markWildcardInUrl(urlObj, "hash", 0, splittedPattern[i]);
                        }
                    }
                }
                combinedUrlPattern = urlObj.fullPath;
            }

            return combinedUrlPattern;
        }

        splitUrlAsSingleArray(urlObj) {
            let splittedUrl = urlObj.pathArr;
            splittedUrl = (urlObj.hashPath) ? splittedUrl.concat(urlObj.hashPathArr) : splittedUrl;
            splittedUrl = (urlObj.search) ? splittedUrl.concat(urlObj.searchArr) : splittedUrl;
            splittedUrl = (urlObj.hash) ? splittedUrl.concat([urlObj.hashVal]) : splittedUrl;
            return splittedUrl;
        }

        splitUrlAsSingleValidArray(urlObj) {
            let splittedUrl = urlObj.pathArr.filter(x => x != '');
            splittedUrl = (urlObj.hashPath) ? splittedUrl.concat(urlObj.hashPathArr.filter(x => x != '')) : splittedUrl;
            splittedUrl = (urlObj.search) ? splittedUrl.concat(urlObj.searchArr.filter(x => x != '')) : splittedUrl;
            splittedUrl = (urlObj.hash && urlObj.hashVal) ? splittedUrl.concat([urlObj.hashVal]) : splittedUrl;
            return splittedUrl;
        }

        getUrlPatternMatchObj(url, urlPattern) {
            let urlMatchJSON = { matchedLen: 0, matchedValidPartsLen: 0, isFullyMatched: false, dynamicMatchLen: 0, wildcardMatchLen: 0 };
            let urlObj = this.parseCustomUrlObj(this.serviceUrlOrigin + url);
            let urlPatternObj = this.parseCustomUrlObj(this.serviceUrlOrigin + urlPattern);

            for (let i = 0; i < urlObj.pathArr.length; i++) {
                if (i < urlPatternObj.pathArr.length && (urlPatternObj.pathArr[i] === urlObj.pathArr[i] || this.isDynamicSegment(urlObj.pathArr[i]) || (this.isDynamicSegment(urlPatternObj.pathArr[i]) && urlObj.pathArr[i] != ""))) {
                    urlMatchJSON = this.updateUrlMatchJSON( urlMatchJSON, urlObj.pathArr[i], urlPatternObj.pathArr[i] );
                    continue;
                }
                return urlMatchJSON;
            }
            if (urlObj.hashPath) {
                if(!urlPatternObj.hashPath) return urlMatchJSON;
                for (let i = 0; i < urlObj.hashPathArr.length; i++) {
                    if (i < urlPatternObj.hashPathArr.length && (urlPatternObj.hashPathArr[i] === urlObj.hashPathArr[i] || this.isDynamicSegment(urlObj.hashPathArr[i]) || (this.isDynamicSegment(urlPatternObj.hashPathArr[i]) && urlObj.hashPathArr[i] != ""))) {
                        urlMatchJSON = this.updateUrlMatchJSON(urlMatchJSON, urlObj.hashPathArr[i], urlPatternObj.hashPathArr[i]);
                        continue;
                    }
                    return urlMatchJSON;
                }
            }
            if (urlObj.searchArr) {
                if (!urlPatternObj.searchArr) return urlMatchJSON;
                for (let i = 0; i < urlObj.searchArr.length; i++) {
                    if (i < urlPatternObj.searchArr.length && (urlPatternObj.searchArr[i] === urlObj.searchArr[i] || this.isDynamicSegment(urlObj.searchArr[i]) || (this.isDynamicSegment(urlPatternObj.searchArr[i]) && urlObj.searchArr[i] != ""))) {
                        urlMatchJSON = this.updateUrlMatchJSON(urlMatchJSON, urlObj.searchArr[i], urlPatternObj.searchArr[i]);
                        continue;
                    }
                    return urlMatchJSON;
                }
            }
            if (urlObj.hash && urlPatternObj.hash
                && (urlObj.hashVal === urlPatternObj.hashVal || (this.isDynamicSegment(urlPatternObj.hashVal) && urlObj.hashVal != ""))) {
                urlMatchJSON = this.updateUrlMatchJSON(urlMatchJSON, urlObj.hashVal, urlPatternObj.hashVal);
            }
            urlMatchJSON.isFullyMatched = urlMatchJSON.matchedLen == this.splitUrlAsSingleArray(urlObj).length ? true : false;
            return urlMatchJSON;
        }

        updateUrlMatchJSON(urlMatchJSON, urlPart, patternPart) {
            urlMatchJSON.matchedLen++;
            urlPart != '' ? urlMatchJSON.matchedValidPartsLen++ : '';
            this.isDynamicSegment(patternPart) ? urlMatchJSON.dynamicMatchLen++ : '';
            /^(\*)$/.test(patternPart) ? urlMatchJSON.wildcardMatchLen++ : '';
            return urlMatchJSON;
        }

        generateUrlDiffJSON(url, urlPattern) {
            let tempUrl = url;
            let splittedWildcardPattern = urlPattern.split(/(\*)/);
            let updatedUrlSplit = [], tempArr = [], canApply = false;

            for (let i = 0; i < splittedWildcardPattern.length; i++) {
                if (tempUrl.startsWith(splittedWildcardPattern[i])) {
                    tempArr.push({ url: splittedWildcardPattern[i], type: "static" });
                    tempUrl = tempUrl.replace(splittedWildcardPattern[i], "");
                    continue;
                } else if (splittedWildcardPattern[i] == "*" && tempUrl != '') {
                    let str = tempUrl.split(/&|\?|\/|#/)[0];
                    if (str != '' && str != '*') {
                        tempArr.push({ url: str, type: "diff" });
                        canApply = true;
                        tempUrl = tempUrl.replace(str, "");
                        continue;
                    }
                }
                tempArr.push({ url: tempUrl, type: "static" });
                canApply = tempArr.length > 1 ? true : false;
                break;
            }
            updatedUrlSplit = tempArr;

            return {
                json: updatedUrlSplit,
                canApply: canApply,
            };
        }

        // Old handling of url

        combineUrlsOnMatch(currrentUrl, pageList) {
            let list = [];
            for (let i = 0; i < pageList.length; i++) {
                let tempurl = pageList[i].link;
                let isUrlMatched = this.URLCheck(currrentUrl, tempurl);
                if (isUrlMatched.matchedlen != 0 || isUrlMatched.isSuccess) {
                    list.push({
                        value: this.mergeUrl(currrentUrl, tempurl, isUrlMatched).url,
                        matchedlen: isUrlMatched.matchedlen,
                        index: i
                    })
                }
            }
            let matchedURL = {
                length: 0,
                index: -1
            };
            for (let i = 0; i < list.length; i++) {
                if (list[i].matchedlen > matchedURL.length) {

                    matchedURL.length = list[i].matchedlen
                    matchedURL.index = i;
                }
            }
            if (matchedURL.length > 0) {
                return list[matchedURL.index].value;
            }
            else {
                return currrentUrl;
            }
        }

        mergeUrl(url1, url2, isUrlMatched) {
            let mergedurl;

            if (isUrlMatched.matchedlen != 0 && url2.search('{{') != -1) {
                if (isUrlMatched.isSuccess) {
                    mergedurl = url2;
                }
                else {
                    mergedurl = url2.substring(0, isUrlMatched.matchedlen) + isUrlMatched.notmatchedUrl;
                }
            }

            return { url: mergedurl, json: isUrlMatched.json };
        }

        URLCheck(url, url_w_pattern) {
            let json = []
            let ogurl = url;
            let og_urlpattern = url_w_pattern;
            if (url_w_pattern == "" || !this.validateDynamicURLSyntax(url_w_pattern)) {
                return { isSuccess: false, reason: "Syntax is wrong!!" };
            }

            let startIndex = 0, endIndex = -1, counter = 0, diffs = [];
            while (counter < 100) {

                startIndex = 0;
                endIndex = url_w_pattern.search("{{");
                let str = "";

                if (endIndex > -1) {
                    str = url_w_pattern.substring(startIndex, endIndex);
                } else if (url_w_pattern == "" || url.endsWith(url_w_pattern)) {
                    let startIndex = url.indexOf(url_w_pattern);
                    if (url_w_pattern == "") {
                        json.push({ url: url.substring(0, url.length), type: "diff" });
                    }
                    else {
                        json.push({ url: url.substring(0, startIndex), type: "diff" });
                        json.push({ url: url.substring(startIndex, url.length), type: "static" });
                    }

                    return { isSuccess: true, reason: "URL is Matching!!", json: json };
                } else {
                    let starts = og_urlpattern.indexOf(url_w_pattern);
                    let start = ogurl.indexOf(url);
                    // let str1 = ogurl.substring(starts,ogurl.length);
                    let matchedlen = url.search('/');

                    let nomatched = ogurl.substring(start + matchedlen, ogurl.length);
                    json.push({ url: url.substring(0, url.search('/')), type: "diff" });
                    json.push({ url: nomatched, type: "static" });
                    return { isSuccess: false, reason: "URL is Mismatching!!", matchedlen: starts, notmatchedUrl: nomatched, json: json };
                }
                if (str == "") {
                    return { isSuccess: true, reason: "URL is Matching!!", json: json };
                } else if (!url.includes(str)) {

                    return { isSuccess: false, reason: "URL Mismatching!!", json: json };
                } else {
                    // console.log('url :> ',url,str,url.search(str),str.length);
                    let start = url.search(str) + str.length;
                    let end = url.length;
                    if (url.search(str) != 0) {
                        json.push({ url: url.substring(0, url.search(str)), type: "diff" });
                        json.push({ url: url.substring(url.search(str), start), type: "static" });
                    }
                    else {
                        json.push({ url: url.substring(0, start), type: "static" });
                    }

                    url = url.substring(start, end);
                    startIndex = url_w_pattern.search("}}") + 2;
                    url_w_pattern = url_w_pattern.substring(startIndex, url_w_pattern.length);
                    //   console.log("URL check: sliced url" + url);
                }
                counter++;
            }

        }

        validateDynamicURLSyntax(url) {
            let istrue = true, counter = 0;
            while (counter < 100) {
                let leftBraceIndx = url.search("{{");
                let rightBraceIndx = url.search("}}");
                //console.log("SYNTAX check: sliced url" + url);
                if (leftBraceIndx > -1 && rightBraceIndx > -1 && this.validateVariableName(url.substring(leftBraceIndx + 2, rightBraceIndx))) {
                    url = url.slice(rightBraceIndx + 2, url.length);
                    //console.log("SYNTAX check: sliced url" + url);
                } else if (leftBraceIndx == -1 && rightBraceIndx == -1) {
                    return true;
                } else {
                    return false;
                }
                counter++;
            }
        }

        validateVariableName(name) {
            return name.match("^[^a-zA-Z_$]|[^\\w$]") == null;
        }

    }

    globalThis.PageCollection = PageCollection;
}
else {
    //PageCollection Class is already defined
}
//$Id$ 
class ScreenRecording {
    static instance = null;

    constructor(stopRecordingCallback) {
        if (ScreenRecording.instance) {
            return ScreenRecording.instance;
        }
        ScreenRecording.instance = this;

        this.mediaRecorder = '';
        this.recordedData = [];
        this.screenStream = null;
        this.audioStream = null;
        this.stopRecordingCallback = stopRecordingCallback;

    }

    async startRecording(callback) {
        try {

            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                preferCurrentTab: true
            });

            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            const combinedStream = new MediaStream([
                ...this.screenStream.getTracks(),
                ...this.audioStream.getAudioTracks()
            ]);

            this.mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: "video/webm; codecs=vp9,opus"
            });

            this.mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    this.recordedData.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.confirmation();
            };

            this.screenStream.getVideoTracks()[0].addEventListener("ended", () => {
                this.mediaRecorder.stop();
            });
            callback("success");
            this.mediaRecorder.start();
        }
        catch (error) {
            callback("error");
        }
    }

    stopRecording() {
        try {
            [...this.screenStream.getTracks(), ...this.audioStream.getTracks()].forEach(track => track.stop());
        } catch (error) {
            alert(error.message);
        }
    }
    confirmation() {
        var status = window.confirm('Video has been successfully recorded. Would you like to download this video?');
        if (status === true) {
            this.downloadVideo();
        } else {
            var msg = {
                status: "failed",
                errorText: "Video is not downloaded"
            }
            this.stopRecordingCallback(msg);
        }
    }

    downloadVideo() {
        const blob = new Blob(this.recordedData, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "recorded-video.webm";
        document.body.appendChild(a);
        a.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(a)
        alert('The video has been successfully downloaded');
        this.stopRecordingCallback();
    }
}


//$Id$
class WalkthroughTextGenerator {
    static instance = '';
    constructor() {
        this.data = {}
    }
    getTitle() {
        return WalkthroughVerification.getInstance().walkthroughSDK.data.name;

    }
    getDefaultText() {
        var walkthroughRef = WalkthroughVerification.getInstance().walkthroughSDK;
        var stepCompletion = walkthroughRef.data.stepCompletionConfig;
        if (stepCompletion[walkthroughRef.ongoingStepNumber] == 'Allow Interaction') {
            return 'Fill the Field';
        }
        else if (stepCompletion[walkthroughRef.ongoingStepNumber] == 'TargetElement') {
            return walkthroughRef.ongoingStepElement.innerText ? 'Click "' + walkthroughRef.ongoingStepElement.innerText + '"' : 'Click here'
        }
        else {
            return this.readTextFromTooltip(walkthroughRef);
        }
    }
    readTextFromTooltip(walkthroughRef) {
        var textelements = walkthroughRef.WalkthroughLayoutManager.ongoingStepLayout.querySelectorAll('[id^="layoutContainer"] > #tooltipLayout > #frame-parent-container > #row-container > .row-child > #textbuilder');
        var res = '';
        textelements.forEach(element => {
            res += element.innerText.trim() ? element.innerText + '\n' : '';
        })
        return res ? res : 'Step ' + (walkthroughRef.ongoingStepNumber + 1);
    }
    static getInstance() {
        if (!WalkthroughTextGenerator.instance) {
            WalkthroughTextGenerator.instance = new WalkthroughTextGenerator();
        }
        return WalkthroughTextGenerator.instance;
    }
}//$Id$
class HTMLGeneration {
    static instance = '';
    constructor() {
        this.type = "";
        this.ExtensionId = "pdpmpoaehnemjojblnnldhhhgnlglhnb";
        this.resJSON = {
            header: {
                favIconLink: '',
                title: '',
                steps: 0
            },
            content: []
        }
        this.textFor = {
            "walkthrough": WalkthroughTextGenerator,
        }
    }
    getOutputData() {
        this.resJSON.header.steps = this.resJSON.content.length;
        return this.resJSON;
    }
    addScreenshot(type, index) {
        this.type = type;
        if (!this.resJSON.header.favIconLink) {
            this.setHeader();
            this.setTabIcon();
        }
        try {
            var res = { imgLink: '', text: '' };
            res["text"] = this.textFor[this.type].getInstance().getDefaultText();

            let request = {
                action: "screenShot",
                data: this.micsWalkthroughConfig,
                index: index - 1
            }
            ExtensionCommunicator.sendMessageToExtension(request, (response) => {
                res["imgLink"] = response.imgURl;
                response.index ? this.resJSON.content[response.index] = res : this.resJSON.content.push(res);// for firefox indexed approach needs to be done
            })
        } catch (err) {

        }
    }
    setHeader() {
        var title = this.textFor[this.type].getInstance().getTitle();
        this.resJSON.header.title = title;
    }
    setTabIcon() {
        var handle = this;
        ExtensionCommunicator.sendMessageToExtension({ action: "getIcon" }, (response) => {
            handle.faviconToBase64(response.imgURl ? response.imgURl : response).then(base64 => {
                if (base64) {
                    handle.resJSON.header.favIconLink = base64
                }
                else {
                    handle.resJSON.header.favIconLink = '';
                }
            })
        }
        )
    }
    async faviconToBase64(faviconUrl) {
        try {
            const response = await fetch(faviconUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch favicon: ${response.statusText}`);
            }
            const blob = await response.blob();
            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
    static getInstance() {
        if (!HTMLGeneration.instance) {
            HTMLGeneration.instance = new HTMLGeneration();
        }
        return HTMLGeneration.instance;
    }
}//$Id$
class InproductMsgListener {
    static listener = null;
    constructor() {
        this.inproducttypevslistenerinstance = {
            "walkthrough": {
                "verify": WalkthroughVerification,
                "preview": WalkthroughPreview,
                "Automate": AutomatedWalkthrough,
                "video": WalkthroughVideoRecord,
                "smarttour": WalkthroughSmartTour,
                "create": WalkthroughBuilderSDK,
                "edit": WalkthroughBuilderSDK,
                "downloadashtml": WalkthroughVerification
            }
        };
        this.trustedsubdomains = ["zoho", "localzoho", "manageengine", "localmanageengine", "zohocloud", "zohonoc"];
        if (this.origincheck(document.referrer)) {
            return
        }
        this.seteventlistener();
        this.notifyReferrer();
    }
    static initialiseListener() {
        if (InproductMsgListener.listener === null) {
            InproductMsgListener.listener = new InproductMsgListener();
        }
        return;
    }

    origincheck(openerurl) {
        openerurl = openerurl.split(".");
        var domainnames = ["https://mics", "https://dapnew","https://micse", "https://micsetest", "https://dap", "https://premics", "https://predap", "https://micsqa","https://dapqa","https://dapqa1","https://dapqa2","https://dapqa3","https://predaptest"]; //need an entry if domain added.
        var testdomainstartswith = "micstest";
        return !(this.trustedsubdomains.includes(openerurl[1]) && (domainnames.includes(openerurl[0]) || openerurl[0].includes(testdomainstartswith)));
    }
    seteventlistener() {
        var handle = this;
        window.addEventListener("message", function (payload) {
            if (payload.data.source === "micsinproduct" && payload.data.startProcess) {
                var inproducttype = payload.data.type.toLowerCase();
                var action = payload.data.message.action;
                var instance = handle.inproducttypevslistenerinstance[inproducttype][action].getInstance();
                instance.processMessage(payload.data.message);
            }
        });
    }

    notifyReferrer() {
        if (document.referrer && (document.referrer.includes("mics") || document.referrer.includes("dap")) && window.opener != null) {
            window.opener.postMessage(
                { source: "micsinproductsdk", action: 'readyToStart' }, document.referrer);
        }
    }

    closeConnection() {
        if (document.referrer && (document.referrer.includes("mics") || document.referrer.includes("dap")) && window.opener != null) {
            window.opener.postMessage(
                { source: "micsinproductsdk", action: 'closeConnection' }, document.referrer);
        }
    }

}

class InproductCompletionListener {
    static sendStatus(inproducType, msg) {
        window.opener.postMessage({ action: "completed", inproducttype: inproducType, "source": "micsinproductsdk", "message": msg }, document.referrer);
    }
}/*$Id$*/
class MicsTextToSpeech {
    static instance = null;
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.utterance = new SpeechSynthesisUtterance();
        this.utteranceOptions = {
            voice: "english-us espeak",
            lang: "en-US",
            pitch: .75,
            rate: 1
        };
        if (this.utteranceOptions) {
            if (this.utteranceOptions.voice) {
                this.speechSynthesis.onvoiceschanged = e => {
                    const voice = this.speechSynthesis.getVoices().find(({
                        name: _name
                    }) => _name === this.utteranceOptions.voice);
                    this.utterance.voice = voice;
                }
                this.speechSynthesis.getVoices();
            }
            let { lang, rate, pitch } = this.utteranceOptions;
            Object.assign(this.utterance, {
                lang, rate, pitch
            });
        }
    }
    startTTS(text, callback) {
        this.utterance.text = text;
        this.utterance.onstart = () => {
        };

        this.utterance.onend = () => {
            if (callback) callback();
        };

        this.speechSynthesis.speak(this.utterance);
    }
    static getInstance() {
        if (!MicsTextToSpeech.instance) {
            MicsTextToSpeech.instance = new MicsTextToSpeech();
        }
        return MicsTextToSpeech.instance;
    }
}//$Id$
class AutomatedWalkthrough {
    static instance = "";
    constructor() {
        this.data = "";
        this.walkthroughSDK = ""
        this.overWriteFunc = { "sendMetric": { "rendered": this.tooltipRendered.bind(this), "endTour": this.tourEnded.bind(this), "error": this.handleError.bind(this), "completed": this.tooltipCompleted.bind(this), "quitted": this.tooltipQuitted.bind(this) } };
        this.targetElement = "";
        this.enableTTS = "";
        this.cursorInstance = "";
        this.showTooltipTimer = null;
        this.animationTimer = null;
        this.parentCallBacks = {};
    }
    processMessage(data, enableTTS, parentCallBacks) {
        this.data = data;
        this.enableTTS = enableTTS;
        this.walkthroughSDK = new WalkthroughWrapper();
        this.walkthroughSDK.init(this.data, this.overWriteFunc);
        this.walkthroughSDK.start(this.data);
        this.parentCallBacks = parentCallBacks || {};
        this.insertCursor();
    }
    insertCursor() {
        var shadowRootRef = document.querySelector('walkthrough-builder').shadowRoot;
        var cursorDiv = document.createElement('div');
        cursorDiv.setAttribute("id", "micscursor");
        cursorDiv.style = "position: absolute; top: 0; left: 0; font-size: 1.8vw; z-index:111111111111111; visibility:hidden;";
        cursorDiv.innerHTML = `<svg  height="24px" viewBox="0 -960 960 960" width="27px" fill="#d4610c"><path d="M419-80q-28 0-52.5-12T325-126L107-403l19-20q20-21 48-25t52 11l74 45v-328q0-17 11.5-28.5T340-760q17 0 29 11.5t12 28.5v200h299q50 0 85 35t35 85v160q0 66-47 113T640-80H419ZM240-720v173q-45-26-72.5-71.5T140-720q0-83 58.5-141.5T340-920q83 0 141.5 58.5T540-720q0 56-27 101.5T441-547v-173q0-42-30-71t-71-29q-42 0-71 29t-29 71Z"/></svg>`;
        shadowRootRef.appendChild(cursorDiv);
    }
    tooltipRendered(data) {
        this.cursorInstance = Cursor.getInstance();
        this.setTargetElementForTrigger();
        this.cursorInstance.initialize(this.targetElement);
        var toottipText = this.readTextFromTooltip();

        if (this.enableTTS && this.data.stepCompletionConfig[this.walkthroughSDK.ongoingStepNumber] == "Allow Interaction") {
            MicsTextToSpeech.getInstance().startTTS(toottipText, null);
        }
        else if (this.enableTTS) {
            MicsTextToSpeech.getInstance().startTTS(toottipText, this.startAnimation.bind(this))
        }
        else if (this.data.stepCompletionConfig[this.walkthroughSDK.ongoingStepNumber] != "Allow Interaction") {
            this.startAnimation(this);
        }
    }
    startAnimation() {
        var self = this;
        this.showTooltipTimer = setTimeout(() => {
            self.cursorInstance.startAnimation();
            self.animationTimer = setTimeout(() => {
                self.triggerEvents();
            }, 1000);
        }, 3000);
    }
    tooltipCompleted(data) {
        clearTimeout(this.showTooltipTimer);
        clearTimeout(this.animationTimer);
        this.cursorInstance.hideCursor();
    }
    handleError(data) {
        clearTimeout(this.showTooltipTimer);
        clearTimeout(this.animationTimer);
        var message = {
            status: "failed",
            data: data
        }
        this.parentCallBacks.error ? this.parentCallBacks.error(data) : InproductCompletionListener.sendStatus("walkthrough", message);

    }
    tooltipQuitted(data) {
        clearTimeout(this.showTooltipTimer);
        clearTimeout(this.animationTimer);
        var message = {
            status: "failed",
        }
        this.parentCallBacks.quitted ? this.parentCallBacks.quitted(data) : InproductCompletionListener.sendStatus("walkthrough", message);
    }
    tourEnded(data) {
        clearTimeout(this.showTooltipTimer);
        clearTimeout(this.animationTimer);
        this.parentCallBacks.endTour ? this.parentCallBacks.endTour(data) : this.showCompletionPopup();
    }
    showCompletionPopup() {
        var message = {
            status: "success",
        }
        document.body.insertAdjacentHTML('beforeend', '<div id="micsEAutomatedWalkthrough" style="position: absolute; width: 100%; height: 100%; top: 0px; left: 0px; background-color: rgba(0, 0, 0, 0.25); backdrop-filter: blur(3px); z-index: 2147483647;"><div id="completion_popup" style="position: absolute; left: calc(50% - 11.5vw); top: 30%; width: 21vw; height: max-content; padding: 1.8vw 2vw; border-radius: .3vw; background: #fff; box-shadow: rgba(17, 17, 26, 0.1) 0px 0px 16px;z-index:11111111111111111111;"> <div id="top" style="display: flex;align-items: center;justify-content: center;"> <div id="icon_parent" style=" height: 4vw; width: 4vw; background: #dbffea85; display: flex; justify-content: center; align-items: center; border-radius: 50%; "> <svg height="35px" viewBox="0 -960 960 960" width="35px" fill="#008100"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"></path></svg> </div> </div> <div id="text" style=" margin-top: 1.3vw; display: flex; align-items: center; justify-content: center; flex-direction: column; font-weight: 500; font-size: .85vw; opacity: .75; "> <span style=" font-size: 1vw; font-weight: 600; opacity: .75; ">Tour Completed!</span>  </div> <div id="footer" style=" margin-top: 1.2vw; display: flex; align-items: center; justify-content: center; "> <div id="button" style=" padding: .5vw 1.3vw; background: #f56e6e; color: #fff; border-radius: .15vw; cursor: pointer; ">Close</div> </div> </div></div>')
        document.querySelector('#micsEAutomatedWalkthrough >#completion_popup >#footer > #button').addEventListener("click", () => {
            InproductCompletionListener.sendStatus("walkthrough", message);
        })
    }
    readTextFromTooltip() {
        const previewContentDivs = document.querySelector('walkthrough-builder').shadowRoot.querySelectorAll('#previewcontentdiv');
        let combinedText = '';
        previewContentDivs.forEach(div => {
            combinedText += div.textContent.trim() + ' ';
        });
        combinedText = combinedText.trim();
        return combinedText;
    }
    setTargetElementForTrigger() {
        var stepCompletionType = this.data.stepCompletionConfig[this.walkthroughSDK.ongoingStepNumber]
        if (stepCompletionType == "TargetElement") {
            if (this.walkthroughSDK.WalkthroughLayoutManager.ongoingStepLayout.querySelector(`[id^="layoutContainer"][trigger_targetelement="true"]`)) {
                this.targetElement = this.walkthroughSDK.WalkthroughLayoutManager.ongoingStepLayout.querySelector(`[id^="layoutContainer"] #footer-container #row-container .row-child > #buttonbuilder > #buttoncontainer[goto_action="NextStep"] > #buttonElement`);
            }
            else {
                this.targetElement = this.walkthroughSDK.ongoingStepElement;
            }
        }
        else if (stepCompletionType == "Block Element") {
            this.targetElement = this.walkthroughSDK.WalkthroughLayoutManager.ongoingStepLayout.querySelector(`[id^="layoutContainer"] #footer-container #row-container .row-child > #buttonbuilder > #buttoncontainer[goto_action="NextStep"] > #buttonElement`);
        }
        else {
            this.targetElement = this.walkthroughSDK.WalkthroughLayoutManager.ongoingStepLayout.querySelector(`[id^="layoutContainer"] #footer-container #row-container .row-child > #buttonbuilder > #buttoncontainer[goto_action="NextStep"] > #buttonElement`);
        }
    }
    triggerEvents() {
        this.targetElement.dispatchEvent(this.createEvent("click"));
        this.targetElement.dispatchEvent(this.createEvent("mousedown"));
    }
    createEvent(eventname) {
        return new MouseEvent(eventname, {
            bubbles: true,
            cancelable: true,
            view: window
        });
    }
    static getInstance() {
        if (!AutomatedWalkthrough.instance) {
            AutomatedWalkthrough.instance = new AutomatedWalkthrough();
        }
        return AutomatedWalkthrough.instance;
    }
}


class Cursor {
    static instance = null;
    constructor() {
        this.cursorRef = document.querySelector('walkthrough-builder').shadowRoot.querySelector("#micscursor");
        this.targetElement = "";
        this.x = "";
        this.y = "";
        this.addEventListeners();
    }
    initialize(targetElement) {
        this.targetElement = targetElement;
        this.setTransitionPoint();

    }
    setTargetPos() {
        const triggerElementPos = this.getElementPosition(this.targetElement);
        const xPos = window.scrollX + triggerElementPos.left + triggerElementPos.width / 2;
        const yPos = window.scrollY + triggerElementPos.top + triggerElementPos.height / 2;
        const cursorElementPos = this.getElementPosition(this.cursorRef);
        this.cursorRef.style.setProperty("--endX", this.x);
        this.cursorRef.style.setProperty("--endY", this.y);
        this.x = xPos - cursorElementPos.width / 2 + 'px';
        this.y = yPos - cursorElementPos.height / 2 + 'px';
    }
    setTransitionPoint() {
        this.setTargetPos();
        this.cursorRef.style.animation = "none";
        this.cursorRef.style.setProperty("--endX", this.x);
        this.cursorRef.style.setProperty("--endY", this.y);
    }
    startAnimation() {
        this.cursorRef.style.animation = 'moveAndScale 1s ease-in-out forwards';
        this.showCursor();

    }
    hideCursor() {
        this.cursorRef.style.setProperty("--startX", this.x);
        this.cursorRef.style.setProperty("--startY", this.y);
        this.cursorRef.style.visibility = "hidden";
        this.removeEventListeners();
    }
    showCursor() {
        this.cursorRef.style.visibility = "visible";
    }
    getElementPosition(element) {
        return element.getBoundingClientRect();
    }
    addEventListeners() {
        var handle = this;
        window.addEventListener('resize', (e) => { handle.handleResize() });
    }
    handleResize() {
        var self = this;
        setTimeout(() => {
            self.setTransitionPoint(self.targetElement);
        }, 200)
    }
    removeEventListeners() {
        window.removeEventListener("resize", this.handleResize());
    }

    static getInstance() {
        if (!Cursor.instance) {
            Cursor.instance = new Cursor();
        }
        return Cursor.instance;
    }
}//$Id$
class WalkthroughWrapper extends WalkthroughSDK {
    constructor() {
        super({ "inproductdomain": "https://tipengine.localzoho.com", "serviceid": "457" }, 123, {});
        this.data = [];
        this.metricsMapping = [
            "rendered",
            "completed",
            "quitted",
        ]
        this.lastTooltipIndex = -1;
    }
    init(data, overWriteFunc) {
        this.data = data;
        this.overWriteFunc = overWriteFunc;
    }
    start() {
        this.setverifydata(this.data);
    }
    sendMetric(data) {
        let metric = {
            'action': "metrics",
            'walkthroughid': this.flowID,
            'promotionid': this.promotionId,
            'orgid': this.orgid,
            'sessionstarttime': this.sessionStartTime,
            'stepnumber': this.ongoingStepNumber + 1,
            'statuscode': data.statusCode,
            'errorcode': data.errorCode ? data.errorCode : undefined,
            'serviceid': this.serviceid,
            'Scope': this.datamanager.WalkthroughData[this.flowID].scope,
            'flowID': this.flowID
        }
        var featureCallBack = this.overWriteFunc["sendMetric"];
        this.lastTooltipIndex = this.lastTooltipIndex < this.ongoingStepNumber ? this.ongoingStepNumber : this.lastTooltipIndex;
        if (this.ongoingWalkthroughData.templates.length - 1 == this.ongoingStepNumber && (data.statusCode == 2 || data.statusCode == 3)) {
            metric.status = "success";
            featureCallBack["endTour"] ? featureCallBack["endTour"](metric) : "";
        }
        else if (data.statusCode <= 3) {
            data.statusCode == 3 ? metric["status"] = "failed" : "",
                featureCallBack[this.metricsMapping[data.statusCode - 1]] ? featureCallBack[this.metricsMapping[data.statusCode - 1]](metric) : "";
        }
        else {
            metric.status = "failed";
            featureCallBack["error"] ? featureCallBack["error"](metric) : "";
        }
    }
    checkTooltipAlreadyRendered() {
        return this.lastTooltipIndex < this.ongoingStepNumber;
    }
}
//$Id$
class WalkthroughPreview {
    static instance = "";
    constructor() {
        this.overWriteFunc = { "sendMetric": { "endTour": this.tourEnded.bind(this), "error": this.handleError.bind(this) } };
    }
    processMessage(data) {
        this.data = data;
        this.walkthroughSDK = new WalkthroughWrapper();
        this.walkthroughSDK.init(this.data, this.overWriteFunc);
        this.walkthroughSDK.start(this.data);
    }
    handleError(data) {
        var message = {
            status: "failed",
            data: data
        }
        InproductCompletionListener.sendStatus("walkthrough", message);
    }
    tourEnded(data) {
        var message = {
            status: "success",
        }
        InproductCompletionListener.sendStatus("walkthrough", message);
    }
    static getInstance() {
        if (!WalkthroughPreview.instance) {
            WalkthroughPreview.instance = new WalkthroughPreview();
        }
        return WalkthroughPreview.instance;
    }
}//$Id$
class WalkthroughVerification {
    static instance = '';
    constructor() {
        this.additionalAction = {
            "htmlgeneration": HTMLGeneration
        }
        this.walkthroughSDK = "";
        this.tabChanged = false;
        this.screenShotTaken = false;
        this.overWriteFunc = { "sendMetric": { "rendered": this.tooltipRendered.bind(this), "endTour": this.tourEnded.bind(this), "error": this.handleError.bind(this) } };
    }
    processMessage(data) {
        this.data = data;
        this.addEventlListeners();
        this.walkthroughSDK = new WalkthroughWrapper();
        this.walkthroughSDK.init(this.data, this.overWriteFunc);
        this.walkthroughSDK.start(this.data);
    }
    tooltipRendered(metrics) {
        var self = this;
        this.screenShotTaken = false;
        if (self.canTakeScreenShot() && !this.walkthroughSDK.checkTooltipAlreadyRendered()) {
            setTimeout(() => { // after rendering tooltip it takes few seconds for show 
                if (!self.tabChanged && !self.screenShotTaken) {
                    self.screenShotTaken = true;
                    HTMLGeneration.getInstance().addScreenshot("walkthrough", metrics.stepnumber);
                }
            }, 200);
        }
    }
    handleError(data) {
        var message = {
            status: "failed",
            data: data
        }
        this.removeEventListeners();
        InproductCompletionListener.sendStatus("walkthrough", message);
    }
    tourEnded() {
        var message = {
            status: "success",
            data: {}
        };
        (this.canTakeScreenShot()) ? message.data["htmlGeneration"] = HTMLGeneration.getInstance().getOutputData() : "";
        this.removeEventListeners();
        InproductCompletionListener.sendStatus("walkthrough", message);
    }
    addEventlListeners() {
        var handle = this;
        document.addEventListener("visibilitychange", (e) => { handle.handleTabChanged() });
    }
    removeEventListeners() {
        document.removeEventListener("visibilitychange", this.handleTabChanged());
    }
    handleTabChanged() {
        var self = this;
        if (self.canTakeScreenShot() && document.hidden) {
            self.tabChanged = true;
        } else {
            if (self.canTakeScreenShot() && !self.screenShotTaken && !self.walkthroughSDK.checkTooltipAlreadyRendered()) {
                setTimeout(() => {
                    self.screenShotTaken = true;
                    HTMLGeneration.getInstance().addScreenshot("walkthrough");
                }, 200);
            }
            self.tabChanged = false;
        }
    }

    canTakeScreenShot() {
        return this.data.extensionConf && !(this.data.extensionConf.status == "noextension" || this.data.extensionConf.status == "oldextension");
    }

    static getInstance() {
        if (!WalkthroughVerification.instance) {
            WalkthroughVerification.instance = new WalkthroughVerification();
        }
        return WalkthroughVerification.instance;
    }
}//$Id$
class WalkthroughVideoRecord {
    static instance = null;
    constructor(data) {
        this.data = data;
        this.statusMsg = {
            status: "failed"
        }
        this.ScreenRecordingSDK = new ScreenRecording(this.sendCompletionStatus.bind(this));
        this.callBacks = { "endTour": this.stopRecording.bind(this), "quitted": this.stopRecording.bind(this), "error": this.stopRecording.bind(this) };
    }
    processMessage(data) {
        this.data = data;
        this.ScreenRecordingSDK.startRecording(this.handleRecordingPermission.bind(this));
    }
    handleRecordingPermission(status) {
        if (status == "success") {
            this.walkthroughSDK = new AutomatedWalkthrough();
            this.walkthroughSDK.processMessage(this.data, true, this.callBacks);
        }
        else {
            var msg = {
                "status": "failed",
            }
            InproductCompletionListener.sendStatus("walkthrough", msg)
        }
    }
    stopRecording(data) {
        this.statusMsg = data;
        if (data.status == "failed") {
            this.sendCompletionStatus(data)
        }
        else {
            this.ScreenRecordingSDK.stopRecording(data);
        }
    }
    sendCompletionStatus(msg) {
        InproductCompletionListener.sendStatus("walkthrough", msg || this.statusMsg);

    }
    static getInstance() {
        if (!WalkthroughVideoRecord.instance) {
            WalkthroughVideoRecord.instance = new WalkthroughVideoRecord();
        }
        return WalkthroughVideoRecord.instance;
    }
}//$Id$
class WalkthroughSmartTour {
    static instance = "";
    constructor() {
        this.data = "";
    }
    processMessage(data) {
        if (WalkthroughSDK.instance) {
            var sdkinstance = WalkthroughSDK.instance;
            if(data.hasDynamicConf){
                sdkinstance.setDynamicConf(data.walkthroughconf);
            }
            if (sessionStorage.getItem("currentongoingWalkthroughDataGID")) return;
            sdkinstance.startsmarttour(data);
            return;
        }
        sessionStorage.setItem("walkthroughsdkdata", JSON.stringify(data));
    }
    static getInstance() {
        if (!WalkthroughSmartTour.instance) {
            WalkthroughSmartTour.instance = new WalkthroughSmartTour();
        }
        return WalkthroughSmartTour.instance;
    }
}
// $Id$
class BuilderPreview {

    constructor(onEndPreview) {
        this.onEndPreviewCallback = onEndPreview;
        this.onGoingPreviewData;
        this.lastReceivedMetric;
        this.elementsRef = {
            info: null,
            infoStyle: null
        };
        this.eventHandlers = this.getBoundMethodsRef();
        this.overWriteFunc = {
            "sendMetric": {
                "endTour": this.onMetricsReceived.bind(this),
                "error": this.onMetricsReceived.bind(this),
                "rendered": this.onMetricsReceived.bind(this),
                "completed": this.onMetricsReceived.bind(this),
                "quitted": this.onMetricsReceived.bind(this)
            }
        };
        this.Util = WalkthroughBuilderSDKUtility;
    }

    startPreview(firstStepUrl, walkthroughFlowData) {
        let walkthroughJSON = {
            flowData: walkthroughFlowData
        };
        window.sessionStorage.setItem("builder.previewFlowData", JSON.stringify(walkthroughJSON));
        window.location.href = window.location.origin + firstStepUrl;
        (window.location.href.includes("#")) ? window.location.reload() : '';
    }

    getBoundMethodsRef() {
        // organised 'this' bound eventHandlers to maintain method reference
        return {
            escapeKeyHandler: this.escapePreview.bind(this)
        }
    }

    handleOngoingPreview(productConf) {
        this.onGoingPreviewData = JSON.parse(window.sessionStorage.getItem("builder.previewFlowData"));
        this.setRenderingSDKInstance(productConf);
        this.renderingSDK.start();
        this.setPreviewListenters();
        this.createInfoElement();
    }

    setRenderingSDKInstance(productConf) {
        this.renderingSDK = new WalkthroughWrapper();
        let wrapperDataFormat = {
            pid: -1,
            materialid: 'walkthroughbuilderpreview',
            data: {}
        }
        wrapperDataFormat.data["walkthroughbuilderpreview"] = this.onGoingPreviewData.flowData;
        this.renderingSDK.init(wrapperDataFormat, this.overWriteFunc);
    }

    onMetricsReceived(metric) {
        this.lastReceivedMetric = metric;
        if (metric.statuscode == 3 || metric.statuscode == 4 || metric.statuscode == 5 || (metric.statuscode == 2 && metric.stepnumber == this.onGoingPreviewData.flowData.templates.length)) {
            this.endPreview();
        }
    }

    setPreviewListenters() {
        // escape key listener
        document.addEventListener("keydown", this.eventHandlers.escapeKeyHandler, true);
    }

    createInfoElement() {
        let infoElementConf = {
            tagName: "div",
            id: "mics-previewModeInfo",
            htmlContent: this.getInfoHtmlContent()
        }
        this.elementsRef.info = this.Util.createHtmlElement(infoElementConf);
        document.body.appendChild(this.elementsRef.info);
        let infoStyleConf = {
            tagName: "style",
            id: "walkthroughInfoStyle",
            htmlContent: this.getInfoStyle()
        };
        this.elementsRef.infoStyle = this.Util.createHtmlElement(infoStyleConf);
        document.head.appendChild(this.elementsRef.infoStyle);
    }

    getInfoHtmlContent() {
        return `<div><span> Click <span class="highlightedText" >Esc</span> to close preview </span></div>`;
    }

    getInfoStyle() {
        return `#mics-previewModeInfo{
                    width: fit-content;
                    text-align: center;
                    z-index: 9999999999999999999999999999999;
                    gap: 0.2vw;
                    padding: 2vw 2vw;
                    padding: 0.2vw 1vw;
                    position: fixed;
                    user-select: none;
                    bottom: 0;
                    inset: auto 0px 5vw;
                    height: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background-color: #232935;
                    border-radius: 6px;
                    box-shadow: #00000040 0 0 12px;
                    opacity: .95;
                    color: #ffffffb3;
                    top: 90%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }

                #mics-previewModeInfo.hide{
                    inset: auto 0 -5vw;
                }
                
                #mics-previewModeInfo>div>span>span.highlightedText{
                    color: #dfdfdf;
                    font-weight: bold;
                }`;
    }

    escapePreview(event) {
        if (event.key == "Escape") {
            this.Util.preventEventBehaviours(event);
            this.renderingSDK.endTour();
            this.endPreview();
        }
    }

    endPreview() {
        this.removePreviewListeners();
        this.clearPreviewInfo();
        this.onEndPreviewCallback(this.lastReceivedMetric);
    }

    removePreviewListeners() {
        document.removeEventListener("keydown", this.eventHandlers.escapeKeyHandler, true);
    }

    clearPreviewInfo() {
        this.elementsRef.info.classList.add("hide");
        this.elementsRef.info.remove();
        this.elementsRef.infoStyle.remove();
    }

}// $Id$
class CssSelector {

    constructor(onTargetSelected) {
        this.targetElementData = {
            element: null,
            dimensions: {},
            selector: ""
        };
        this.onTargetSelectedCallback = onTargetSelected;
        this.selectorConf = null;
        this.elementsRef = {
            highlighter: null,
            cursorStyleTag: null,
            crossoriginwarning: null,
            info: null,
            infoStyle: null
        };
        this.eventHandlers = this.getBoundMethodsRef();
        this.Util = WalkthroughBuilderSDKUtility;
        this.cqs = new CustomQuerySelector();
        this.iframeHandle = new IframeContentSelector(this.onEventsFromIframe.bind(this));
    }

    getBoundMethodsRef() {
        // organised 'this' bound eventHandlers to maintain method reference
        return {
            fetchTargetElement: this.fetchTargetElement.bind(this),
            escapeKeyHandler: this.escapeKeyHandler.bind(this),
            updateTargetSelector: this.updateTargetSelector.bind(this),
            // onMouseenterIframe: this.onMouseenterIframe.bind(this)
        }
    }

    startSelectorMode() {
        this.targetElementData.selector = "";
        this.createHighlighterElement();
        this.changeCursorStyle();
        this.iframeHandle.startIframeSelector();
        this.setSelectorEventListeners();
        this.createInfoElement();
    }

    createHighlighterElement() {
        let highlighterConf = {
            tagName: "div",
            id: "walkthroughHighlighterElement"
        }
        this.elementsRef.highlighter = this.Util.createHtmlElement(highlighterConf);
        document.body.appendChild(this.elementsRef.highlighter);
        let styleObj = {
            "position": "fixed",
            "border": "1px solid #6ffff8",
            "backgroundColor": "#6fdddb8c",
            "pointer-events": "none",
            "z-index": "999999999"
        };
        this.Util.setElementStyle(this.elementsRef.highlighter, styleObj);
        this.createCrossOriginWarningElement();
    }

    createCrossOriginWarningElement() {

        let elementConf = {
            tagName: "div",
            id: "walkthroughCrossOriginElement"
        }
        this.elementsRef.crossoriginwarning = this.Util.createHtmlElement(elementConf);
        this.elementsRef.crossoriginwarning.innerHTML = `<div style="display: flex"><svg xmlns="" height="1.2vw" viewBox="0 0 24 24" width="1.5vw" fill="#B89230"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg></div> <div style="display: flex; align-items: center;">We're unable to add a step here because this section is from another source!</div>`;
        this.elementsRef.highlighter.appendChild(this.elementsRef.crossoriginwarning);
        let styleObj = {
            "display": "none",
            "position": "relative",
            "top":"50%",
            "left": "50%",
            "width": "fit-content",
            "transform": "translate(-50%, -50%)",
            "background-color": "rgb(255, 243, 205)",
            "pointer-events": "none",
            "color": "rgb(160 135 60)",
            "padding":"0.57em 0.75em",
            "border-radius": "0.2vw",
            "font-size": "0.85vw",
            "box-shadow": "rgb(68 68 68 / 20%) 0px 2px 8px 0px"
        };
        this.Util.setElementStyle(this.elementsRef.crossoriginwarning, styleObj);
    }

    changeCursorStyle() {
        let styleConf = {
            tagName: "style",
            id: "walkthroughCursorStyle",
            htmlContent: '* { cursor: crosshair !important; }'
        }
        this.elementsRef.cursorStyleTag = this.Util.createHtmlElement(styleConf);
        document.head.appendChild(this.elementsRef.cursorStyleTag);
    }

    onEventsFromIframe(params) {
        switch (params.action) {
            case 'fetchedTarget':
                this.highlightIframeTarget(params.target);
                break;
            case 'updateTarget':
                this.updateTargetSelector(params.event);
                break;
            case 'escape':
                this.escapeKeyHandler(params.event);
                break;
        }
    }

    setSelectorEventListeners() {
        window.focus();
        window.addEventListener("mousemove", this.eventHandlers.fetchTargetElement, true);
        document.addEventListener('keydown', this.eventHandlers.escapeKeyHandler, true);
        document.addEventListener("click", this.eventHandlers.updateTargetSelector, true);
        document.addEventListener('mousedown', this.preventEventBehaviours, true);
        document.addEventListener('mouseup', this.preventEventBehaviours, true);
    }

    createInfoElement() {
        let infoElementConf = {
            tagName: "div",
            id: "selectorModeInfo",
            htmlContent: this.getInfoHtmlContent()
        }
        this.elementsRef.info = this.Util.createHtmlElement(infoElementConf);
        document.body.appendChild(this.elementsRef.info);
        let infoStyleConf = {
            tagName: "style",
            id: "walkthroughInfoStyle",
            htmlContent: this.getInfoStyle()
        }
        this.elementsRef.infoStyle = this.Util.createHtmlElement(infoStyleConf);
        document.head.appendChild(this.elementsRef.infoStyle);
    }

    getInfoHtmlContent() {
        return `<span class="text"> Select an element to add a tooltip, or press 
                    <span style="font-weight: bold;">Esc</span> to go back
                </span>`
    }

    getInfoStyle() {
        return `#selectorModeInfo{
                    width: max-content;
                    height: 2.8vw;
                    min-width: 8vw;
                    pointer-events: none;
                    z-index: 999999999;
                    padding: 0 1.5vw;
                    position: fixed;
                    inset: auto 0 2.5vw;
                    margin-left: auto;
                    margin-right: auto;
                    justify-content: center;
                    display: flex;
                    align-items: center;
                    background-color: #232935eb;
                    border-radius: 0.25vw;
                    box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 12px;
                }

                #selectorModeInfo.hide{
                    inset: auto 0 -5vw;
                }
                
                #selectorModeInfo>.text{
                    font-size: 0.9vw;
                    letter-spacing: 0.035em;
                    color: rgba(255, 255, 255, 0.9);
                }`;
    }

    fetchTargetElement(event) {
        this.preventEventBehaviours(event);
        let element = this.cqs.getElementFromPoint({
            x: event.clientX,
            y: event.clientY
        });
        if (element && element != this.targetElementData.element && element.tagName != 'IFRAME') {
            this.targetElementData.element = element;
            this.highlightTargetElement();
        }

        if (element && Array.from(element.children).every(child => child.tagName === 'IFRAME')) {
            let iframes = Array.from(element.children).filter(child => child.tagName === 'IFRAME');
            iframes.forEach(iframe => {
                if (iframe.src && new URL(iframe.src).origin !== window.location.origin) {
                    console.warn("Cross-origin iframe detected. Skipping iframe handlers.");
                    this.showcrossoriginwarning();
                } else {
                    this.hidecrossoriginwarning();
                }
            });

        }
        else{
            this.hidecrossoriginwarning();
        }
    }

    showcrossoriginwarning(){
        this.elementsRef.crossoriginwarning.style.display = "flex";
    }
    hidecrossoriginwarning(){
        this.elementsRef.crossoriginwarning.style.display = "none";
    }
    highlightTargetElement() {
        this.targetElementData.dimensions = this.targetElementData.element.getBoundingClientRect();
        this.setHighlighterPosition(this.targetElementData.dimensions);
    }

    setHighlighterPosition(boundingRect) {
        let styleObj = {
            "top": boundingRect.top + "px",
            "left": boundingRect.left + "px",
            "height": boundingRect.height + "px",
            "width": boundingRect.width + "px"
        }
        this.Util.setElementStyle(this.elementsRef.highlighter, styleObj)
    }

    highlightIframeTarget(element) {
        if (element != this.targetElementData.element) {
            this.targetElementData.element = element;
            this.targetElementData.dimensions = this.Util.getElementDimensions(element);
            this.setHighlighterPosition(this.targetElementData.dimensions);
        }
    }

    escapeKeyHandler(event) {
        this.preventEventBehaviours(event);
        if (event.key == "Escape") {
            this.endSelectorMode(event);
        }
    }

    endSelectorMode(event) {
        this.preventEventBehaviours(event);
        this.clearSelectorEventListeners();
        delete this.targetElementData.element;
        (this.onTargetSelectedCallback) ? this.onTargetSelectedCallback(this.targetElementData) : '';
        this.clearSelectorElements();
        this.iframeHandle.clearIframeHandlers();
    }

    preventEventBehaviours(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    clearSelectorEventListeners() {
        window.removeEventListener("mousemove", this.eventHandlers.fetchTargetElement, true);
        document.removeEventListener('keydown', this.eventHandlers.escapeKeyHandler, true);
        document.removeEventListener("click", this.eventHandlers.updateTargetSelector, true);
        document.removeEventListener('mousedown', this.preventEventBehaviours, true);
        document.removeEventListener('mouseup', this.preventEventBehaviours, true);
    }

    clearSelectorElements() {
        this.elementsRef.highlighter.remove();
        this.elementsRef.cursorStyleTag.remove();
        this.elementsRef.info.classList.add("hide");
        this.elementsRef.info.remove();
        this.elementsRef.infoStyle.remove();
    }

    setSelectorConf(conf) {
        this.selectorConf = (conf) ? conf : this.selectorConf;
    }

    getSelectorConf() {
        let selectorConf = {
            id: false,
            classname: true,
            dataattribute: true
        };
        return (this.selectorConf && Object.keys(this.selectorConf).length != 0) ? this.selectorConf : selectorConf;
    }

    updateTargetSelector(event) {
        this.preventEventBehaviours(event);
        if (this.targetElementData.element) {
            this.targetElementData.selector = this.cqs.constructSelector(this.targetElementData.element, this.getSelectorConf());
            this.endSelectorMode(event);
        }
    }

    setOnSelectedCallback(onTargetSelected) {
        this.onTargetSelected = onTargetSelected;
    }

}// $Id$
class DOMObserver {

    constructor(onObservedDomChange) {
        this.onObservedDomChange = onObservedDomChange;
        this.activeTargetElement = null;
        this.domObserver = {
            mutationObserver: null,
            resizeObserver: null,
            positionCheckIntervalID: ''
        };
        this.Util = WalkthroughBuilderSDKUtility;
    }

    setTargetElement(element) {
        (this.activeTargetElement) ?
            this.destroyDOMObservers() : '';
        this.activeTargetElement = element;
        this.Util.scrollToTarget(this.activeTargetElement);
        this.observeDOMElement();
    }

    observeDOMElement() {
        this.setMutationObserver();
        this.setResizeObserver();
        this.checkPositionOnInterval()
    }

    setMutationObserver() {
        this.domObserver.mutationObserver = new MutationObserver(() => {
            setTimeout(() => { this.onObservedDomChange() }, 10)
        });
        this.domObserver.mutationObserver.observe(this.activeTargetElement, {
            childList: true,
            subtree: true
        });
    }

    setResizeObserver() {
        this.domObserver.resizeObserver = new ResizeObserver(() => {
            setTimeout(() => { this.onObservedDomChange() }, 10)
        });
        this.domObserver.resizeObserver.observe(this.activeTargetElement);
    }

    checkPositionOnInterval() {
        let self = this;
        let initialPosition = self.getElementPosition(self.activeTargetElement), currentPosition;
        (self.domObserver.positionCheckIntervalID) ?
            window.clearInterval(self.domObserver.positionCheckIntervalID) : '';
        self.domObserver.positionCheckIntervalID = window.setInterval(
            () => {
                currentPosition = self.getElementPosition(self.activeTargetElement);
                if (initialPosition.top != currentPosition.top || initialPosition.left != currentPosition.left) {
                    initialPosition = JSON.parse(JSON.stringify(currentPosition));
                    self.onObservedDomChange();
                }
            }, 500);
    }

    getElementPosition(element) {
        try {
            return this.Util.getElementDimensions(element);
        }
        catch (err) { };
        return { top: '', left: '', height: '', width: '' };
    }

    destroyDOMObservers() {
        if (this.activeTargetElement) {
            this.domObserver.mutationObserver.disconnect();
            this.domObserver.resizeObserver.disconnect();
            window.clearInterval(this.domObserver.positionCheckIntervalID);
        }
    }

}// $Id$
class Interaction {

    constructor(onEndInteraction) {
        this.onEndInteractionCallback = onEndInteraction;
        this.targetElementData = {};
        this.elementsRef = {
            endInteractionBtn: null,
            endInteractionBtnStyle: null,
            backdropRoot: null,
            highlighterBox: null
        };
        this.windowDimensions = {
            height: 0,
            width: 0
        };
        this.backdropBoxes = ["topbox", "bottombox", "rightbox", "leftbox"]
        this.eventHandlers = this.getBoundMethodsRef();
        this.domObserver = new DOMObserver(this.eventHandlers.repositionInteractArea);
        this.Util = WalkthroughBuilderSDKUtility;
    }

    getBoundMethodsRef() {
        return {
            endInteractionMode: this.endInteractionMode.bind(this),
            repositionInteractArea: this.repositionInteractArea.bind(this)
        };
    }

    startInteractionMode(targetElementData, backdropConfig, highlighterConfig) {
        this.targetElementData = JSON.parse(JSON.stringify(targetElementData));
        this.targetElementData.element = this.Util.getElement(this.targetElementData.selector);
        this.calculateWindowDimension();
        this.createBackdropRoot();
        this.drawBackdrop(backdropConfig);
        (highlighterConfig.type != "None") ? this.drawHighlighterBox(highlighterConfig) : '';
        this.createEndInteractionBtn();
        this.setInteractionEventListeners();
    }

    calculateWindowDimension() {
        let html = document.documentElement;
        this.windowDimensions.height = Math.max(document.body.scrollHeight, document.body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        let windowInnnerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        let scrollbarWidth = windowInnnerWidth - document.documentElement.clientWidth;
        this.windowDimensions.width = windowInnnerWidth - scrollbarWidth;
    }

    createBackdropRoot() {
        let backdropRootConf = {
            tagName: "div",
            id: "",
            className: "walkthroughBackdropRoot"
        };
        this.elementsRef.backdropRoot = this.Util.createHtmlElement(backdropRootConf);
        document.documentElement.appendChild(this.elementsRef.backdropRoot);
        this.elementsRef.backdropRoot.style.position = "fixed";
        this.elementsRef.backdropRoot.style.zIndex = "10000000000000000000";
    }

    drawBackdrop(backdropConfig) {
        let backdropElementConf = { tagName: "div", className: "", id: "" };
        let backdropStyle = { position: "fixed" };
        backdropStyle.backgroundColor = (backdropConfig.type == "Overlay") ? "#01010171" : "transparent";
        backdropStyle.pointerEvents = (backdropConfig.type == "Overlay" || !backdropConfig.hasClickthrough) ? "all" : "none";
        for (let i = 0; i < this.backdropBoxes.length; i++) {
            backdropElementConf.className = "backdrop" + this.backdropBoxes[i];
            let backdropElement = this.Util.createHtmlElement(backdropElementConf);
            this.elementsRef.backdropRoot.appendChild(backdropElement);
            this.Util.setElementStyle(backdropElement, backdropStyle);
        }
        this.positionBackdrop();
    }

    positionBackdrop() {
        let targetElementDimensions = this.targetElementData.dimensions;
        let backdropDimensions = {
            leftbox: {
                top: 0,
                left: 0,
                height: this.windowDimensions.height + 'px',
                width: targetElementDimensions.left + 'px'
            },
            rightbox: {
                top: 0,
                right: 0,
                height: this.windowDimensions.height + 'px',
                width: this.windowDimensions.width - targetElementDimensions.left - targetElementDimensions.width + 'px'
            },
            bottombox: {
                top: targetElementDimensions.top + targetElementDimensions.height + 'px',
                left: targetElementDimensions.left + 'px',
                height: this.windowDimensions.height - targetElementDimensions.top - targetElementDimensions.height + 'px',
                width: targetElementDimensions.width + 'px'
            },
            topbox: {
                top: 0,
                left: targetElementDimensions.left + 'px',
                height: targetElementDimensions.top > 0 ? targetElementDimensions.top + 'px' : '0px',
                width: targetElementDimensions.width + 'px'
            }
        };
        for (let i = 0; i < this.backdropBoxes.length; i++) {
            let backdrop = this.elementsRef.backdropRoot.querySelector(".backdrop" + this.backdropBoxes[i]);
            this.Util.setElementStyle(backdrop, backdropDimensions[this.backdropBoxes[i]]);
        }
    }

    drawHighlighterBox(highlighterConfig) {
        let highlighterBoxConf = { tagName: "div", className: "highlighterBox", id: "" };
        this.elementsRef.highlighterBox = this.Util.createHtmlElement(highlighterBoxConf);
        this.elementsRef.highlighterBox.style.outline = highlighterConfig.bordercolor + " solid " + highlighterConfig.borderwidth + "px";
        this.elementsRef.highlighterBox.style.position = "fixed";
        this.elementsRef.highlighterBox.style.pointerEvents = "none";
        this.elementsRef.backdropRoot.appendChild(this.elementsRef.highlighterBox);
        this.positionHighlighterBox();
    }

    positionHighlighterBox() {
        let targetElementDimensions = this.targetElementData.dimensions;
        let highlighterBoxDimension = {
            top: targetElementDimensions.top + "px",
            left: targetElementDimensions.left + "px",
            height: targetElementDimensions.height + "px",
            width: targetElementDimensions.width + "px"
        };
        this.Util.setElementStyle(this.elementsRef.highlighterBox, highlighterBoxDimension);
    }

    createEndInteractionBtn() {
        let btnConf = {
            tagName: "div",
            id: "walkthroughEndInteractionBtn",
            htmlContent: this.getEndInteractionBtnHtml()
        }
        this.elementsRef.endInteractionBtn = this.Util.createHtmlElement(btnConf);
        this.elementsRef.backdropRoot.appendChild(this.elementsRef.endInteractionBtn);
        let btnStyleConf = {
            tagName: "style",
            id: "walkthrougEndInteractionBtnStyle",
            htmlContent: this.getEndInteractionBtnStyle()
        };
        this.elementsRef.endInteractionBtnStyle = this.Util.createHtmlElement(btnStyleConf);
        this.elementsRef.backdropRoot.appendChild(this.elementsRef.endInteractionBtnStyle);
    }

    getEndInteractionBtnHtml() {
        return `<div id="borderanimation"></div>
                <div id="text">Click here after interaction.</div>`;
    }

    getEndInteractionBtnStyle() {
        return `#walkthroughEndInteractionBtn {
                  height: max-content;
                  width: max-content;
                  text-align: center;
                  cursor: pointer;
                  z-index: 9999999999999;
                  padding: 2px;
                  position: fixed;
                  inset: auto 0 5vw;
                  margin-left: auto;
                  margin-right: auto;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #00232e;
                  border-radius: 5px;
                  box-shadow: #0000009e -1px 7px 12px;
                  overflow: hidden;
                  transition: 0.2s ease-in-out;
                }

                #walkthroughEndInteractionBtn.hide {
                  inset: auto 0px -5vw;
                }

                #walkthroughEndInteractionBtn>#text {
                  width: max-content;
                  max-width: 30vw;
                  min-width: 8vw;
                  height: 2.9vw;
                  background-color: #00232e;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 0.2vw;
                  padding: 0 1.75vw;
                  font-size: 0.9vw;
                  letter-spacing: 0.035em;
                  color: #ffffffef;
                }

                #walkthroughEndInteractionBtn>#borderanimation {
                  animation: rotate 2s linear infinite;
                  background: linear-gradient(90deg, rgba(0, 0, 0, 0) 23%, rgb(0 238 222) 100%);
                  width: 40vw;
                  height: 40vw;
                  position: absolute;
                  z-index: -1;
                }

                @keyframes rotate {
                  0% {
                    transform: rotate(1turn);
                  }
                }`
    }

    setInteractionEventListeners() {
        this.elementsRef.endInteractionBtn.addEventListener("click", this.eventHandlers.endInteractionMode);
        this.domObserver.setTargetElement(this.targetElementData.element);
        window.addEventListener("resize", this.eventHandlers.repositionInteractArea);
    }

    repositionInteractArea() {
        this.targetElementData.dimensions = this.Util.getElementDimensions(this.targetElementData.element);
        this.calculateWindowDimension();
        this.positionBackdrop();
        (this.elementsRef.highlighterBox) ? this.positionHighlighterBox() : null;
    }

    endInteractionMode() {
        this.elementsRef.endInteractionBtn.removeEventListener("click", this.eventHandlers.endInteractionMode);
        this.domObserver.destroyDOMObservers();
        window.removeEventListener("resize", this.eventHandlers.repositionInteractArea);
        this.elementsRef.backdropRoot.remove();
        this.onEndInteractionCallback();
    }

}// $Id$

class BuilderSDKMessenger {

    constructor(builderSDKRef) {
        this.builderSDK = builderSDKRef;
        this.receiverWindow = null;
        this.targetOrigin = '';
        this.setMessageListener();
    }

    setMessageListener() {
        this.messageListener = (event) => {
            if (event.data.targetName === "walkthroughBuilderSDK") {
                this.messageHandler(event.data.action, event.data.payload);
            }
        };
        window.addEventListener("message", this.messageListener);
    }

    messageHandler(action, payload) {
        action = (action) ? action : '';
        switch (action) {
            case "iframeLoaded":
                this.builderSDK.onIframeLoaded();
                break;
            case 'initBuilder':
                this.builderSDK.createBuilder(payload.micsWalkthroughConfig);
                break;
            case 'cssSelectorMode':
                this.builderSDK.startCssSelectorMode(payload.selectorConf);
                break;
            case 'validateNSetDomTarget':
                this.builderSDK.validateNSetTargetElement(payload.selector);
                break;
            case 'getCurrentUrl':
                this.builderSDK.sendCurrentUrlToIframe();
                break;
            case 'getNewCssSelector':
                this.builderSDK.getNewCssSelector(payload.selector, payload.selectorConf);
                break;
            case 'previewMode':
                this.builderSDK.startBuilderPreview(payload.flowStartingUrl, payload.walkthroughFlowData);
                break;
            case "navigationMode":
                this.builderSDK.startNavigationMode();
                break;
            case "setDOMObserverTarget":
                this.builderSDK.validateNSetTargetElement(payload.selector);
                break;
            case "triggerTarget":
                this.builderSDK.triggerTargetElement();
                break;
            case "interactiveMode":
                this.builderSDK.startInteractiveMode(payload.backdropConfig, payload.highlighterConfig);
                break;
            case "exitBuilder":
                this.builderSDK.removeBuilder();
                break;
            case "preview":
                this.builderSDK.startPreviewFlow(payload.micsWalkthroughConfig);
                break;
            case "verify":
                this.builderSDK.startVerifyFlow(payload.micsWalkthroughConfig);
                break;
            case "edit":
                this.builderSDK.startEditingFlow(payload.micsWalkthroughConfig);
                break;
            case "closeTab":
                this.builderSDK.closeTab();
            case "onWalkthroughSaved":
                this.updateWalkthroughSavedState();
        }
    }

    updateSDKReadyState() {
        window.postMessage({ targetName: "extensionContentScript" }, "*");
    }

    updateWalkthroughSavedState() {
        window.opener.postMessage({ WalkthroughCallback: true, status: 'success', type: 'save' }, "*");
    }

    initializeIframeCommunication(iframeWindow, frameOrigin) {
        this.receiverWindow = iframeWindow;
        this.targetOrigin = frameOrigin ? frameOrigin : "*";
    }

    messageToBuilderIframe(action, payload) {
        let msgData = {
            targetName: "walkthroughBuilderIframe",
            action: action,
            payload: payload
        };
        this.receiverWindow.postMessage(msgData, this.targetOrigin);
    }

    removeMessageListener() {
        window.removeEventListener("message", this.messageListener);
    }

}
/*$Id$*/

class CustomQuerySelector {

    constructor() {
        this.context = null;
        this.selectorSequence = [];
        this.contextElements = [];
        this.setDefaults();
    }

    setDefaults() {
        this.context = document;
    }

    getElementFromPoint(position) {
        this.contextElements = (this.context != document) ? this.contextElements : [];
        let currElement = this.context.elementFromPoint(position.x, position.y);
        if (currElement && currElement.shadowRoot && (this.context != currElement.shadowRoot)) {
            this.contextElements.push(currElement);
            this.context = currElement.shadowRoot;
            return this.getElementFromPoint(position);
        }
        this.context = document;
        return currElement;
    }

    parseStringToArray(selectorStr) {
        return selectorStr.split("|");
    }

    parseArrayToString(selectorArr) {
        return selectorArr.join(" ");
    }

    constructSelector(element, selectorConf) {
        let selectorList = [];
        let selector = '';
        if (document.contains(element)) {
            selector = this.getUniqueCssSelector(element, selectorConf, document);
        }
        else if (element.ownerDocument != document) {
            let currentElement = element;
            while (currentElement.ownerDocument !== document) {
                const iframeElement = currentElement.ownerDocument.defaultView.frameElement;
                selectorList.unshift(this.getUniqueCssSelector(currentElement, selectorConf, currentElement.ownerDocument));
                selectorList.unshift('|iframe|');
                currentElement = iframeElement;
            }
            selectorList.unshift(this.getUniqueCssSelector(currentElement, selectorConf, currentElement.ownerDocument));
            selector = this.parseArrayToString(selectorList);
        }
        else if (element.getRootNode() instanceof DocumentFragment) {
            let tempElement = element;
            do {
                selectorList.unshift(this.getUniqueCssSelector(tempElement, selectorConf, tempElement.getRootNode()));
                selectorList.unshift("|shadowDOM|");
                tempElement = tempElement.getRootNode().host;
            } while (tempElement.getRootNode() instanceof DocumentFragment);
            selectorList.unshift(this.getUniqueCssSelector(tempElement, selectorConf, document));
            selector = this.parseArrayToString(selectorList);
        }
        return selector;
    }

    getElement(selector) {
        try {
            let selectorList = this.parseStringToArray(selector),
                element = null,
                tempSelector, contextTag;
            this.context = document;
            do {
                tempSelector = selectorList.shift().trim();
                element = (tempSelector != '') ? this.context.querySelector(tempSelector) : element;
                if (!element || selectorList.length == 0) {
                    break;
                }
                contextTag = selectorList.shift().trim().toLowerCase();
                if (contextTag == 'iframe') {
                    this.context = element.contentDocument;
                } else if (contextTag == 'shadowdom') {
                    this.context = element.shadowRoot;
                } else {
                    break;
                }
            } while (selectorList.length > 0);
            this.context = document;
            return element;
        }
        catch (error) {
            return null;
        }
    }

    getAllElement(selector) {
        try {
            let selectorList = this.parseStringToArray(selector)
            if (selectorList.length > 1) {
                let element = this.getElement(selector);
                return (element) ? [element] : [];
            }
            return (selector.trim() != '') ? document.querySelectorAll(selector) : [];
        } catch (error) {
            return [];
        }
    }

    //unique css-selector Utility

    getUniqueCssSelector(element, selectorConf, context) {
        this.context = (context) ? context : document;
        let path = [];
        this.checkedComby = [];
        let counter = 0;
        while (element) {
            let json = {
                comby: []
            }
            let selector = element.tagName.toLowerCase();
            json.tagName = selector;
            if (element.id && selectorConf.id) {
                let id = this.isValidID(element.id) ? `#` + element.id : `[id='${element.id}']`;
                json.comby.push(id);
            }
            if (element.dataset && Object.keys(element.dataset).length && selectorConf.dataattribute) {
                for (let data in element.dataset) {
                    data = `[data-${data}="${element.dataset[data]}"]`;
                    json.comby.push(data);
                }
            }
            if (element.classList.length != 0 && selectorConf.classname) {
                let classes = element.classList;
                classes = Array.from(classes, (classString) => "." + classString);
                json.comby = json.comby.concat(classes);
                json.comby = json.comby.length > 2 ? this.getSelectorCombination(json.comby) : json.comby;
            }
            let sibling = element;
            let nth = 0;
            while (sibling) {
                sibling = sibling.previousElementSibling;
                nth++;
            }
            json.comby.push(`:nth-child(${nth})`);

            if (this.checkedComby.length > 100) {
                this.checkedComby = this.checkedComby.slice(0, 100);
            }
            element = element.parentElement;
            counter++;
            path.unshift(json);
            let uniqueSelector = this.getUniqueSelectorCombination(json);
            if (uniqueSelector) {
                this.context = document;
                return uniqueSelector;
            }
        }
    }

    isValidID(id) {
        //if it starts with number then it is not valid id
        let startwwithnumber = RegExp(/^[A-Za-z]+[^\:\.]/);
        return (startwwithnumber.test(id));
        // `#${element.id}`;
    }

    isValidClass(className) {
        //if it contains special character , then it is not valid classname
        let pattern = RegExp(/[:;'/*&#@$%^()?]/);
        return (!pattern.test(className)) && (!className.includes('.'))
        // `#${element.id}`;
    }

    getSelectorCombination(list) {
        let set = [], listSize = list.length, combinationsCount = (1 << listSize);
        for (let i = 1; i < combinationsCount; i++) {
            let combination = [];
            for (let j = 0; j < listSize; j++) {
                if ((i & (1 << j)))
                    combination.push(list[j]);
            }
            combination.length <= 2 ? set.push(combination.join("")) : '';
        }
        return set;

    }

    getUniqueSelectorCombination(elementConf) {
        for (let i = 0; i < elementConf.comby.length; i++) {
            elementConf.comby[i] = elementConf.tagName + elementConf.comby[i];
        }
        return this.validateSelectorCombinations(elementConf.comby);
    }

    validateSelectorCombinations(comby) {
        let newCheckedComby = [];
        for (let i = 0; i < comby.length; i++) {
            try {
                this.context.querySelectorAll(comby[i]);
            }
            catch (err) {
                continue;
            }
            if (this.checkedComby.length) {
                for (let j = 0; j < this.checkedComby.length; j++) {
                    let selector = comby[i] + " > " + this.checkedComby[j];
                    let selLength = this.context.querySelectorAll(selector).length;
                    if (selLength == 1) {
                        return selector;
                    } else if (selLength > 1) {
                        newCheckedComby.push(selector);
                    }
                }
            } else if (this.context.querySelectorAll(comby[i]).length == 1) {
                return comby[i];
            } else {
                newCheckedComby.push(comby[i]);
            }
        }
        this.checkedComby = newCheckedComby;
        return false;
    }

}
// $Id$

class IframeContentSelector {

    constructor(parentCallback) {
        this.parentCallback = parentCallback;
        this.windowContext = null;
        this.documentContext = null;
        this.elementsRef = {
            sameOriginIframes: [],
            crossOriginIframes: [],
            iframeNodes: [],
            cursorStyleTags: []
        };
        this.activeFrame = null;
        this.activeDimensions = {};
        this.iframeInterval = null;
        this.Util = WalkthroughBuilderSDKUtility;
        this.eventHandlers = this.getBoundMethodsRef();
    }

    getBoundMethodsRef() {
        return {
            fetchTargetFromIframe: this.fetchTargetFromIframe.bind(this),
            setTargetFromIframe: this.setTargetFromIframe.bind(this),
            escapeKeyHandler: this.escapeKeyHandler.bind(this),
        }
    }

    startIframeSelector() {
        this.elementsRef.iframeNodes = [];
        this.elementsRef.sameOriginIframes = [];
        this.elementsRef.cursorStyleTags = [];       
        var self=this;
        this.iframeInterval = setInterval(() => self.iterateIfranes(document), 1000);
    }

    iterateIfranes(documentContext = document) {
        const iframes = documentContext.querySelectorAll("iframe");
        iframes.forEach(iframe => {
            if (this.elementsRef.iframeNodes.includes(iframe)) {
                return;
            }
            this.elementsRef.iframeNodes.push(iframe);
            if (iframe.contentDocument) {
                this.handleSameOriginIframe(iframe);
                this.iterateIfranes(iframe.contentDocument);
            } else {
                this.handleCrossOriginIframe(iframe);
            }
        });
    }

    handleSameOriginIframe(element) {
        this.elementsRef.sameOriginIframes.push(element);
        this.setIframeEventListeners(element);
        this.elementsRef.cursorStyleTags.push(this.changeCursorStyle(element));
    }

    handleCrossOriginIframe(element) {
        this.elementsRef.crossOriginIframes.push(element);
        element.style.pointerEvents = "none";
    }

    clearIframeHandlers() {
        if(this.iframeInterval) {
            clearInterval(this.iframeInterval);
            this.iframeInterval = null;
        }
        this.elementsRef.sameOriginIframes.forEach((element, i) => {
            if (element && element.contentDocument) {
                this.removeIframeEventListeners(element);
                this.elementsRef.cursorStyleTags[i].remove();
            }
        });
        this.elementsRef.crossOriginIframes.forEach((element, i) => {
            if (element) {
                this.clearCrossOriginIframeHandlers(element);
            }
        });
        this.elementsRef.sameOriginIframes = [];
        this.elementsRef.crossOriginIframes = [];
        this.elementsRef.cursorStyleTags = [];
    }

    setIframeEventListeners(element) {
        element.contentDocument.addEventListener("mousemove", this.eventHandlers.fetchTargetFromIframe, true);
        element.contentDocument.addEventListener('keydown', this.eventHandlers.escapeKeyHandler, true);
        element.contentDocument.addEventListener("click", this.eventHandlers.setTargetFromIframe, true);
        element.contentDocument.addEventListener('mousedown', this.preventEventBehaviours, true);
        element.contentDocument.addEventListener('mouseup', this.preventEventBehaviours, true);
    }

    changeCursorStyle(element) {
        let styleConf = {
            tagName: "style",
            id: "walkthroughCursorStyle",
            htmlContent: '* { cursor: crosshair !important; }'
        }
        let cursorStyleTag = this.Util.createHtmlElement(styleConf);
        element.contentDocument.head.appendChild(cursorStyleTag);
        return cursorStyleTag;
    }

    fetchTargetFromIframe(event) {
        this.preventEventBehaviours(event);
        this.activeFrame = event.view.frameElement;
        let params = {
            action: "fetchedTarget",
            target: event.target
        };
        this.parentCallback(params);
    }

    preventEventBehaviours(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    setTargetFromIframe(event) {
        let params = { action: "updateTarget", event: event };
        this.parentCallback(params);
    }

    escapeKeyHandler(event) {
        let params = { action: "escape", event: event };
        this.parentCallback(params);
    }

    removeIframeEventListeners(element) {
        element.contentDocument.removeEventListener("mousemove", this.eventHandlers.fetchTargetFromIframe, true);
        element.contentDocument.removeEventListener('keydown', this.eventHandlers.escapeKeyHandler, true);
        element.contentDocument.removeEventListener("click", this.eventHandlers.setTargetFromIframe, true);
        element.contentDocument.removeEventListener('mousedown', this.preventEventBehaviours, true);
        element.contentDocument.removeEventListener('mouseup', this.preventEventBehaviours, true);
    }

    clearCrossOriginIframeHandlers(element) {
        element.style.pointerEvents = "auto";
    }

}// $Id$
class Navigation {

    constructor(onEndNavigation) {
        this.onEndNavigationCallback = onEndNavigation;
        this.elementsRef = {
            endNavigationBtn: null,
            endNavigationBtnStyle: null
        };
        this.eventHandlers = this.getBoundMethodsRef();
        this.Util = WalkthroughBuilderSDKUtility;
    }

    getBoundMethodsRef() {
        return {
            endNavigationMode: this.endNavigationMode.bind(this)
        };
    }

    startNavigation() {
        this.createEndNavigationBtn();
        this.setNavigationEventListeners();
    }

    createEndNavigationBtn() {
        let btnConf = {
            tagName: "div",
            id: "walkthroughEndNavigationBtn",
            htmlContent: this.getEndNavigationBtnHtml()
        }
        this.elementsRef.endNavigationBtn = this.Util.createHtmlElement(btnConf);
        document.body.appendChild(this.elementsRef.endNavigationBtn);
        let btnStyleConf = {
            tagName: "style",
            id: "walkthrougEndNavigationBtnStyle",
            htmlContent: this.getEndNavigationBtnStyle()
        };
        this.elementsRef.endNavigationBtnStyle = this.Util.createHtmlElement(btnStyleConf);
        document.head.appendChild(this.elementsRef.endNavigationBtnStyle);
    }

    getEndNavigationBtnHtml() {
        return `<div id="borderanimation"></div>
                <div id="text">Click here to resume creating your walk-through flow.</div>`;
    }

    getEndNavigationBtnStyle() {
        return `#walkthroughEndNavigationBtn {
                  height: max-content;
                  width: max-content;
                  text-align: center;
                  cursor: pointer;
                  z-index: 9999999999999;
                  padding: 2px;
                  position: fixed;
                  inset: auto 0 5vw;
                  margin-left: auto;
                  margin-right: auto;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #00232e;
                  border-radius: 5px;
                  box-shadow: #0000009e -1px 7px 12px;
                  overflow: hidden;
                  transition: 0.2s ease-in-out;
                }

                #walkthroughEndNavigationBtn.hide {
                  inset: auto 0px -5vw;
                }

                #walkthroughEndNavigationBtn>#text {
                  width: max-content;
                  max-width: 30vw;
                  min-width: 8vw;
                  height: 2.9vw;
                  background-color: #00232e;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 0.2vw;
                  padding: 0 1.75vw;
                  font-size: 0.9vw;
                  letter-spacing: 0.035em;
                  color: #ffffffef;
                }

                #walkthroughEndNavigationBtn>#borderanimation {
                  animation: rotate 2s linear infinite;
                  background: linear-gradient(90deg, rgba(0, 0, 0, 0) 23%, rgb(0 238 222) 100%);
                  width: 40vw;
                  height: 40vw;
                  position: absolute;
                  z-index: -1;
                }

                @keyframes rotate {
                  0% {
                    transform: rotate(1turn);
                  }
                }`
    }

    setNavigationEventListeners() {
        this.elementsRef.endNavigationBtn.addEventListener("click", this.eventHandlers.endNavigationMode);
    }

    endNavigationMode() {
        this.elementsRef.endNavigationBtn.removeEventListener("click", this.eventHandlers.endNavigationMode);
        this.elementsRef.endNavigationBtn.remove();
        this.elementsRef.endNavigationBtnStyle.remove();
        this.onEndNavigationCallback();
    }

}// $Id$
class WalkthroughBuilderSDKUtility {

    static cqs = new CustomQuerySelector();

    static createHtmlElement(elementConf) {
        let element = document.createElement((elementConf.tagName ? elementConf.tagName : "div"));
        elementConf.id ? element.setAttribute("id", elementConf.id) : '';
        elementConf.className ? element.setAttribute("class", elementConf.className) : '';
        element.innerHTML += (elementConf.htmlContent) ? elementConf.htmlContent : '';
        return element;
    }

    static setElementStyle(element, styleObj) {
        for (let styleType in styleObj) {
            element.style[styleType] = styleObj[styleType];
        }
    }

    static getElement(cssSelector) {
        return this.cqs.getElement(cssSelector);
    }

    static getElementDimensions(element) {
        const elementRect = element.getBoundingClientRect();
        const dimensions = {
            top: elementRect.top,
            left: elementRect.left,
            width: elementRect.width,
            height: elementRect.height
        };
        let currentElement = element;
        while (currentElement.ownerDocument.defaultView.frameElement) {
            const frame = currentElement.ownerDocument.defaultView.frameElement;
            const frameRect = frame.getBoundingClientRect();
            dimensions.top += frameRect.top;
            dimensions.left += frameRect.left;
            currentElement = frame;
        };
        return dimensions;
    }

    static getSelectorMatchStatus(cssSelector) {
        let elementList = WalkthroughBuilderSDKUtility.cqs.getAllElement(cssSelector);
        return (elementList.length == 1) ?
            "foundUnique" : ((elementList.length > 1) ?
                "foundMultiple" : "notFound");
    }

    static preventEventBehaviours(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    static getCurrentUrl() {
        return window.location.href;
    }

    static scrollToTarget(targetElement, behavior = "smooth") {
        targetElement.scrollIntoView({ behavior: behavior, block: "center", inline: "nearest" });
    }

}// $Id$
class WalkthroughBuilderSDK {

    static instance = null;

    constructor() {
        this.walkthroughConfig;  // service id, org id,
        this.builderIframeRef = null;
        this.frameOrigin = "*"; // will be replaced with tipengine domain
        this.targetElementData = {};
        this.urlCheck = {
            lastUpdatedUrl: '',
            intervalId: ''
        };
        this.targetElementCheck = {
            intervalId: '',
        };
        this.eventHandlers = this.getBoundMethodsRef()
        this.messenger = new BuilderSDKMessenger(this);
        this.cssSelector = new CssSelector(this.updateSelectedTargetElement.bind(this));
        this.builderPreview = new BuilderPreview(this.onEndPreview.bind(this));
        this.domObserver = new DOMObserver(this.updateDomChanges.bind(this));
        this.navigation = new Navigation(this.startBuilderMode.bind(this));
        this.interaction = new Interaction(this.endInteractiveMode.bind(this));
        this.customQuerySelector = new CustomQuerySelector();
        this.Util = WalkthroughBuilderSDKUtility;
        this.editableFlowData;
    }

    static getInstance() {
        if (WalkthroughBuilderSDK.instance == null) {
            WalkthroughBuilderSDK.instance = new WalkthroughBuilderSDK();
            return WalkthroughBuilderSDK.instance;
        }
        return WalkthroughBuilderSDK.instance;
    }

    getBoundMethodsRef() {
        // organised 'this' bound eventHandlers to maintain method reference
        return {
            initBuilderIframe: this.initBuilderIframe.bind(this),
            startBuilderMode: this.startBuilderMode.bind(this),
        };
    }

    initialize() {
        this.checkOngoingWalkthroughMode();
    }

    checkOngoingWalkthroughMode() {
        let mode = window.sessionStorage.getItem("builder.ongoingWalkthroughMode");
        if (mode) {
            this.walkthroughConfig = JSON.parse(window.sessionStorage.getItem("micsWalkthroughConfig"));
            (this.builderIframeRef == null) ? this.createBuilderIframe() : '';
            this.messenger.initializeIframeCommunication(this.builderIframeRef.contentWindow, this.frameOrigin);
            switch (mode) {
                case "preview":
                    this.builderPreview.handleOngoingPreview(this.walkthroughConfig);
                    break;
                case "navigation":
                    this.startNavigationMode();
                    break;
                case "builder":
                    this.builderIframeRef.addEventListener("load", this.eventHandlers.startBuilderMode);
                    break;
            }
        } else {
            this.messenger.updateSDKReadyState();
        }
    }

    processMessage(msgData) {
        let mode = window.sessionStorage.getItem("builder.ongoingWalkthroughMode");
        if (!mode) {
            switch (msgData.builderSDKData.action) {
                case "create":
                    this.createBuilder(msgData.builderSDKData);
                    break;
                case "edit":
                    this.startEditingFlow(msgData.builderSDKData);
                    break;
            };
        }
    }

    createBuilder(micsWalkthroughConfig) {
        window.sessionStorage.setItem("micsWalkthroughConfig", JSON.stringify(micsWalkthroughConfig));
        this.walkthroughConfig = micsWalkthroughConfig;
        this.createBuilderIframe();
        this.builderIframeRef.addEventListener("load", this.eventHandlers.initBuilderIframe);
    }

    createBuilderIframe() {
        this.builderIframeRef = document.createElement('iframe');
        this.builderIframeRef.src = this.getFrameURL();
        this.frameOrigin = (this.walkthroughConfig.iscustomdomain == true) ? location.origin : this.walkthroughConfig.micstipDomain;
        let style = {
            width: '100vw',
            position: 'fixed',
            inset: '0',
            border: 'none',
            zIndex: '1000000000000000000000000000000000000',
            backgroundColor: "white"
        };
        this.Util.setElementStyle(this.builderIframeRef, style);
        document.documentElement.appendChild(this.builderIframeRef);
        this.hideBuilder();
    }

    getFrameURL() {
        let frameUrl;
        let tipDomain = this.walkthroughConfig.micstipDomain.split('//')[1].replace("tipengine.", "").split('.').reverse();
        let domainCheck = (location.hostname).split('.').reverse();
        domainCheck = domainCheck.slice(0, tipDomain.length).join('');
        tipDomain = tipDomain.join('');
        if (tipDomain === domainCheck) {
            frameUrl = this.walkthroughConfig.micstipDomain + "/jsp/walkthroughBuilder.jsp?frameorigin=" + location.origin;
            this.walkthroughConfig.iscustomdomain = false;
        }
        else {
            frameUrl = location.origin + "/mics/jsp/walkthroughBuilder.jsp?frameorigin=" + location.origin;
            this.walkthroughConfig.iscustomdomain = true;
        }
        window.sessionStorage.setItem("micsWalkthroughConfig", JSON.stringify(this.walkthroughConfig));
        return frameUrl;
    }

    initBuilderIframe() {
        this.messenger.initializeIframeCommunication(this.builderIframeRef.contentWindow, this.frameOrigin);
        this.sendCurrentUrlToIframe();
        (this.editableFlowData) ?
            this.messenger.messageToBuilderIframe(
                "initEditFlow",
                { "micsWalkthroughConfig": this.walkthroughConfig, "flowData": this.editableFlowData, "flowStartingUrl": this.Util.getCurrentUrl() }
            ) :
            this.messenger.messageToBuilderIframe(
                "initBuilder",
                { "micsWalkthroughConfig": this.walkthroughConfig }
            );
        this.startBuilderMode();
    }

    startBuilderMode() {
        this.checkUrlOnInterval();
        this.showBuilder();
        window.sessionStorage.setItem("builder.ongoingWalkthroughMode", "builder");
    }

    onIframeLoaded() {
        this.builderIframeRef.style.backgroundColor = "unset";
    }

    showBuilder() {
        let previousMode = window.sessionStorage.getItem("builder.ongoingWalkthroughMode");
        if (previousMode && previousMode != "builder") {
            window.setTimeout(() => {
                this.builderIframeRef.style.height = "100vh";
                this.builderIframeRef.contentWindow.focus();
            }, 500);
        } else {
            this.builderIframeRef.style.height = "100vh";
            this.builderIframeRef.contentWindow.focus();
        }
    }

    hideBuilder() {
        this.builderIframeRef.style.height = "0px";
        window.focus();
    }

    checkUrlOnInterval() {
        this.sendCurrentUrlToIframe();
        this.urlCheck.lastUpdatedUrl = this.Util.getCurrentUrl();
        window.clearInterval(this.urlCheck.intervalId);
        this.urlCheck.intervalId = window.setInterval(
            () => {
                if (this.urlCheck.lastUpdatedUrl != this.Util.getCurrentUrl()) {
                    this.sendCurrentUrlToIframe();
                    this.urlCheck.lastUpdatedUrl = this.Util.getCurrentUrl();
                }
            },
            500
        );
    }

    startCssSelectorMode(selectorConf) {
        this.hideBuilder();
        (selectorConf) ? this.cssSelector.setSelectorConf(selectorConf) : null;
        this.cssSelector.startSelectorMode();
    }

    validateCssSelector(selector) {
        this.messenger.messageToBuilderIframe(
            "cssSelectorValidated",
            { "cssSelectorMatch": this.Util.getSelectorMatchStatus(selector) }
        );
    }

    sendCurrentUrlToIframe() {
        this.messenger.messageToBuilderIframe(
            "currentUrl",
            { "pageUrl": this.Util.getCurrentUrl() }
        );
    }

    startNavigationMode() {
        window.sessionStorage.setItem("builder.ongoingWalkthroughMode", "navigation");
        this.hideBuilder();
        this.navigation.startNavigation();
    }

    startBuilderPreview(flowStartingUrl, flowData) {
        window.sessionStorage.setItem("builder.ongoingWalkthroughMode", "preview");
        this.builderPreview.startPreview(flowStartingUrl, flowData);
    }

    updateSelectedTargetElement(selectedElementData) {
        let response = {}, element;
        response.selectedElementData = selectedElementData;
        if (selectedElementData.selector != '') {
            response.status = "selected";
            element = this.Util.getElement(selectedElementData.selector);
            this.Util.scrollToTarget(element, "instant");
            this.targetElementData.selector = selectedElementData.selector;
            this.targetElementData.dimensions = this.Util.getElementDimensions(element);
            this.domObserver.setTargetElement(element);
        } else {
            response.status = "exited";
        }
        this.messenger.messageToBuilderIframe(
            "cssSelectorModeResponse",
            { "response": response }
        );
        this.showBuilder();
    }

    onEndPreview(previewMetric) {
        this.messenger.messageToBuilderIframe("previewModeEnd",
            { "metric": previewMetric });
        this.startBuilderMode();
    }

    validateNSetTargetElement(cssSelector) {
        let matchStatus = this.Util.getSelectorMatchStatus(cssSelector);
        this.targetElementData.selector = cssSelector;
        switch (matchStatus) {
            case "notFound":
                this.checkTargetElementOnInterval(cssSelector);
                break;
            default:
                window.clearInterval(this.targetElementCheck.intervalId);
                let element = this.Util.getElement(cssSelector);
                this.targetElementData.dimensions = this.Util.getElementDimensions(element);
                this.domObserver.setTargetElement(element);
        };
        this.messenger.messageToBuilderIframe(
            "cssSelectorValidated",
            { "cssSelectorMatch": matchStatus }
        );
    }

    checkTargetElementOnInterval() {
        window.clearInterval(this.targetElementCheck.intervalId);
        let cssSelector = this.targetElementData.selector;
        this.targetElementCheck.intervalId = window.setInterval(
            () => {
                if (this.targetElementData.selector != cssSelector) window.clearInterval(this.targetElementCheck.intervalId);
                let matchStatus = this.Util.getSelectorMatchStatus(cssSelector);
                switch (matchStatus) {
                    case "notFound":
                        break;
                    default:
                        this.validateNSetTargetElement(cssSelector);
                }
            }, 1000);
    }

    updateDomChanges() {
        let matchStatus = this.Util.getSelectorMatchStatus(this.targetElementData.selector);
        switch (matchStatus) {
            case "notFound":
                this.validateNSetTargetElement(this.targetElementData.selector);
                break;
            default:
                let elementDimensions = this.Util.getElementDimensions(this.Util.getElement(this.targetElementData.selector));
                this.messenger.messageToBuilderIframe(
                    "domChangesObserved",
                    { "targetElementDimensions": elementDimensions }
                );
        };
    }

    triggerTargetElement() {
        let targetElement = this.Util.getElement(this.targetElementData.selector);
        targetElement.dispatchEvent(new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    }

    getNewCssSelector(oldSelector, selectorConf) {
        let element = this.Util.getElement(oldSelector);
        let newSelector = this.customQuerySelector.constructSelector(element, selectorConf);
        this.messenger.messageToBuilderIframe(
            "updateNewCssSelector",
            { "newCssSelector": newSelector }
        );
    }

    startInteractiveMode(backdropConfig, highlighterConfig) {
        this.hideBuilder();
        this.interaction.startInteractionMode(this.targetElementData, backdropConfig, highlighterConfig);
    }

    endInteractiveMode() {
        this.startBuilderMode();
    }

    removeBuilder() {
        window.sessionStorage.removeItem("builder.ongoingWalkthroughMode");
        this.messenger.removeMessageListener();
        window.clearInterval(this.urlCheck.intervalId);
        this.domObserver.destroyDOMObservers();
        this.builderIframeRef.remove();
        InproductMsgListener && InproductMsgListener.listener ? InproductMsgListener.listener.closeConnection() : "";
    }

    // startPreviewFlow(walkthroughConfig) {
    //     if (!WalkthroughSDK.getInstance()) return;
    //     let flowData = JSON.parse(walkthroughConfig.flowData),
    //         walkthroughData = JSON.parse(flowData.data).layoutdata;
    //     let walkthroughJSON = {
    //         flowID: flowData.id,
    //         PID: "0",
    //         renderingMode: "preview",
    //     };
    //     this.initWalkthroughSDK(walkthroughJSON, walkthroughData);
    // }

    // initWalkthroughSDK(walkthroughJSON, walkthroughData) {
    //     window.sessionStorage.setItem("currentongoingWalkthroughDataGID", JSON.stringify(walkthroughJSON));
    //     window.sessionStorage.setItem(walkthroughJSON.flowID, JSON.stringify(walkthroughData));
    //     window.location.reload();
    // }

    // startVerifyFlow(walkthroughConfig) {
    //     if (!WalkthroughSDK.getInstance()) return;
    //     let flowData = JSON.parse(walkthroughConfig.flowData),
    //         walkthroughData = JSON.parse(flowData.data);
    //     let walkthroughJSON = {
    //         flowID: flowData.id,
    //         PID: "-1",
    //         renderingMode: "verify"
    //     };
    //     this.initWalkthroughSDK(walkthroughJSON, walkthroughData);
    // }

    startEditingFlow(walkthroughConfig) {
        this.editableFlowData = walkthroughConfig.flowdata;
        this.createBuilder(walkthroughConfig);
    }

    closeTab() {
        window.close();
    }

}// $Id$

window.addEventListener("load", () => {
    if ((document.referrer && (document.referrer.includes("mics") || document.referrer.includes("dap"))) && window.top === window && window.sessionStorage.getItem("builder.ongoingWalkthroughMode") != null && !sessionStorage.getItem("MICS.BuilderInjected")) {
        let builderSDK = WalkthroughBuilderSDK.getInstance();
        builderSDK.initialize();
    } else if ((document.referrer && (document.referrer.includes("mics") || document.referrer.includes("dap")) && window.opener != null) && window.top === window && InproductMsgListener.listener == null) {
        InproductMsgListener.initialiseListener();
    }
});
/*$Id$*/

//Check if ExtensionCommunicator is already declared;

if (!globalThis.ExtensionCommunicator) {

    class ExtensionCommunicator {
        static extensionID = "pdpmpoaehnemjojblnnldhhhgnlglhnb";
        static currentVersion = 2.2;
        static featureVersionMapping = {
            walkthrough: 2,
            video: 2,
            guide: 2.2,
        };
        static DapfeatureVersionMapping = {
            walkthrough: 2.1,
            video: 2.1,
            guide: 2.2,
        };
        static callbackIdcounter = 0;
        static callbackStacks = [];
        static extensionDownloadLink = "h"+"ttps://chromewebstore.google.com/detail/zoho-digital-adoption-pla/clpgadppfmgccacjjldmieljfmplinal?authuser=0&hl=en";

        static {
            window.top.addEventListener("message", (event) => {
                if (event.data.source !== "MICS_EXTENSION" || event.data.callbackid == undefined)
                    return;
                ExtensionCommunicator.callbackStacks[event.data.callbackid](event.data);
            });

            try {
                chrome.runtime.sendMessage(
                    ExtensionCommunicator.extensionID, { action: "isExtensionInstalled" },
                    (response) => {
                        if (response == undefined) {
                        } else {
                            let data = {};
                            data.version = response.version ? response.version : 1.1;
                            data.isInstalled = response.isInstalled;
                            sessionStorage["mics.extension.metadata"] = JSON.stringify(data);
                        }
                    }
                );
            } catch (error) { }
        }

        static sendMessageToExtension(data, callback) {
            const sendMessage = (response) => {
                if (!response) {
                    callback(false);
                    return;
                };
                if (response.version > 2) {
                    let callbackid = ++ExtensionCommunicator.callbackIdcounter;
                    ExtensionCommunicator.callbackStacks[callbackid] = callback;
                    data.callbackid = callbackid;
                    data.source = "MICS_SCRIPTS";
                    window.top.postMessage(data, "*");
                } else {
                    try {
                        chrome.runtime.sendMessage(ExtensionCommunicator.extensionID, data,
                            (response) => {
                                if (response == undefined) {
                                    callback(response);
                                    return;
                                } else {
                                    callback(response);
                                }
                            }
                        );
                    } catch (error) {
                        callback(false);
                    }
                }
            }

            ExtensionCommunicator.isExtensionInstalled(sendMessage);
        }

        static isExtensionInstalled(callback) {
            if (sessionStorage.getItem("mics.extension.metadata")) {
                let response = JSON.parse(sessionStorage.getItem("mics.extension.metadata"));
                //if version is lessthan or equal to 2 , send message to extension;
                if (response.version <= 2) {
                    ExtensionCommunicator.isOldExtensionInstalled(callback);
                } else {
                    callback(response);
                }
            } else {
                let writeMetaToSession = (response) => {
                    if (!response) {
                        callback(false);
                        return;
                    }
                    let data = {};
                    data.version = response.version ? response.version : 1.1;
                    data.isInstalled = response.isInstalled;
                    sessionStorage["mics.extension.metadata"] = JSON.stringify(data);
                    callback(response);
                }
                ExtensionCommunicator.isOldExtensionInstalled(writeMetaToSession);
            }
        }

        static isOldExtensionInstalled(callback) {
            try {
                chrome.runtime.sendMessage(ExtensionCommunicator.extensionID, { action: "isExtensionInstalled" },
                    (response) => {
                        if (!response) {
                            sessionStorage.removeItem("mics.extension.metadata");
                            callback(false);
                            return;
                        }
                        callback(response);
                    });
            } catch (error) {
                sessionStorage.removeItem("mics.extension.metadata");
                callback(false);
            }
        }
    }

    globalThis.ExtensionCommunicator = ExtensionCommunicator;
} else {
    //ExtensionCommunicator Class is already defined
}
