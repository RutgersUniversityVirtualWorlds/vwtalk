

	// Initialize API key, session, and token...
	  // Think of a session as a room, and a token as the key to get in to the room
	  // Sessions and tokens are generated on your server and passed down to the client
	 // var apiKey = "24960472";
	  var managementSessionId = "{{world.opentokSessions.management}}";
	  var unionSessionId = "{{world.opentokSessions.union}}";
	  var middleSessionId = "{{world.opentokSessions.middle}}";
	  var managementToken;
	  var unionToken;
	  var middleToken;
	// Initialize session, set up event listeners, and connect
	var unionSession = TB.initSession(unionSessionId);
	var managementSession = TB.initSession(managementSessionId);
	var middleSession = TB.initSession(middleSessionId);
	var currentSession;
	var deviceManager;
	var devicePanel;
	var currentRoom = "middle";
	var isMicOn = true;
	var sessionToJoinOnStart;
	var myName;
	managementSession.addEventListener('streamCreated', streamCreatedHandler);
	unionSession.addEventListener('streamCreated', streamCreatedHandler);
	middleSession.addEventListener('streamCreated', streamCreatedHandler);
	unionSession.addEventListener('sessionConnected', sessionConnectedHandler);
	managementSession.addEventListener('sessionConnected', sessionConnectedHandler);
	middleSession.addEventListener('sessionConnected', sessionConnectedHandler);
	unionSession.addEventListener('streamDestroyed', streamDestroyedHandler);
	middleSession.addEventListener('streamDestroyed', streamDestroyedHandler);
	managementSession.addEventListener('streamDestroyed', streamDestroyedHandler);
	managementSession.addEventListener('sessionDisconnected', sessionDisconnectedHandler);
	middleSession.addEventListener('sessionDisconnected', sessionDisconnectedHandler);
	unionSession.addEventListener('sessionDisconnected', sessionDisconnectedHandler);
	console.log("Initialized opentok");
	
	function sessionConnectedHandler(event) {
		console.log("Session connected");
		currentSession = event.target;
		event.target.publish(publisher);
		console.log("Published publisher");
		subscribeToStreams(event.streams);
		console.log("Subscribed to streams");
		//addDeviceManager();
		console.log("Added device manager");
		var stateManager = event.target.getStateManager();
		stateManager.set(event.target.connection.connectionId, myName);
		// Subscribe to streams that were in the session when we connected
	}
	function addDeviceManager() {
		deviceManager = TB.initDeviceManager(apiKey);
		deviceManager.addEventListener("devicesDetected", devicesDetectedHandler);
		deviceManager.detectDevices();
		displayPanel();
	}
	function displayPanel() {
		var newDiv = document.createElement("div");
		newDiv.id = "devicePanel";
		document.getElementById("devicePanelContainer").appendChild(newDiv);
		devicePanel = deviceManager.displayPanel("devicePanel", publisher);
		devicePanel.addEventListener("devicesSelected", devicesSelectedHandler);
	}
	function devicesDetectedHandler(event) {
		reportDevices(event.selectedCamera, event.selectedMicrophone);
	}
	function streamCreatedHandler(event) {
		console.log("New stream created");
		// Subscribe to any new streams that are created
		subscribeToStreams(event.streams);
	}
	function streamDestroyedHandler(event) {
		console.log("Stream destroyed");
		for (var i = 0; i < event.streams.length; i++) {
			var stream = event.streams[i];
			unsubscribe(stream, event.target);
		}
	}
	function unsubscribe(stream, session)
	{
		console.log("Unsubscribing");
		var subscribers = session.getSubscribersForStream(stream);
		for (var i=0; i < subscribers.length; i++)
		{
			session.unsubscribe(subscribers[i]);
		}
	}

	function devicesSelectedHandler(event) {
	    reportDevices(event.camera, event.microphone);
	}

	function stateManagerChange(event)
	{
		for (key in event.changedValues)
		{
			var nameDiv  = document.createElement('p');
			nameDiv.innerText = event.changedValues[key];
			$("#stream"+key).append(nameDiv);
		}
	}

	function reportDevices(camera, mic) {
		if(mic==null)
		{
			console.log("No mic found");
		}
	}

	function closePanel() {
	    deviceManager.removePanel(devicePanel);
	    document.getElementById("closeButton").style.visibility = "hidden";
	}
	function subscribeToStreams(streams) {
		console.log("Subscribing to "  + streams.length + " streams");
		for (var i = 0; i < streams.length; i++) {
			console.log(streams[i].name);
			// Make sure we don't subscribe to ourself
			if (streams[i].connection.connectionId == currentSession.connection.connectionId) {
			  return;
			}
			
			// Create the div to put the subscriber element in to
			var div = document.createElement('div');
			div.setAttribute('id', 'stream' + streams[i].streamId);
			$("#opentokstreams").append(div);
			var subProperties = new Object();
			subProperties.height = 50;
			subProperties.width = 128;
			subProperties.style = {};
			subProperties.style.nameDisplayMode = "on";
			// Subscribe to the stream
			subscriber = currentSession.subscribe(streams[i], div.id, subProperties);
		}
	}
	function sessionDisconnectedHandler(event) {
		console.log("Disconnected");
		event.preventDefault();
	}
	//everything below here is a function called by unity
	function initUser(username) {
	  var publisherProperties = new Object();
  	  publisherProperties.publishVideo = false;
	  publisherProperties.width=128;
	  publisherProperties.height=30;
	  publisherProperties.name = username;
	  publisher = TB.initPublisher(apiKey, 'myPublisherDiv', publisherProperties);
	  var socket = io.connect('http://rugrid.rutgers.edu:3004');
	  socket.on('connect', function () {
	  	socket.emit('generateToken', {"session": managementSessionId, "name" : username}, function (token) {
			console.log("Got token: " + token);
			managementToken = token; 
			if(sessionToJoinOnStart == managementSession)
			{
				console.log("Connecting to management session");
				managementSession.connect(apiKey, managementToken);
			}
		});
	  	socket.emit('generateToken', {"session": unionSessionId, "name" : username}, function (token) {
			console.log("Got token: " + token);
			unionToken = token; 
			if(sessionToJoinOnStart == unionSession)
			{
				console.log("Connecting to union session");
				unionSession.connect(apiKey, unionToken);
			}
		});
	  	socket.emit('generateToken', {"session": middleSessionId, "name" : username}, function (token) {
			console.log("Got token: " + token);
			middleToken = token; 
			if(sessionToJoinOnStart == middleSession)
			{
				console.log("Connecting to middle session");
				middleSession.connect(apiKey, middletoken);
			}
		});
	  });
	}
	function RoomChange(newroom) {
		if(newroom=="middle" && currentSession!=middleSession)
		{
			console.log("Switching to middle session.");
			if(currentSession!=null)
			{
				currentSession.disconnect();
			}
			if(middleToken!=null)
			{
				middleSession.connect(apiKey, middleToken);
			}
			else
			{
				sessionToJoinOnStart == middleSession;
			}
		}
		else if(newroom=="management" && currentSession!=managementSession)
		{
			console.log("Switching to management session");
			if(currentSession!=null)
			{
				currentSession.disconnect();
			}
			if(managementToken!=null)
			{
				managementSession.connect(apiKey, managementToken);
			}
			else
			{
				sessionToJoinOnStart = managementSession;
			}
		}
		else if(newroom=="union" && currentSession!=unionSession)
		{
			console.log("Switching to union session");
			if(currentSession!=null)
			{
				currentSession.disconnect();
			}
			if(unionToken!=null)
			{
				unionSession.connect(apiKey, unionToken);
			}
			else
			{
				sessionToJoinOnStart = unionSession;
			}
		}
	}
	function MicMute(isMuted) {
		console.log("Muting mic: " + isMuted);
		if(isMuted == "True")
		{
			publisher.publishAudio(false);
		}
		else
		{
			publisher.publishAudio(true);
		}
	}
	function SetVolume(newVolume) {
		//newVolume is either 0-2 while we can set the volume to 0-100
	}