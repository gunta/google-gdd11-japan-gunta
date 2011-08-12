
var anim = {
	enabled: true,
	counterX: 1.5,
	counterY: 1,
	counterZ: 0,
	image: Object,
	stage: Object,
	stats: Object,
	self: this,
	lastTime: 0,
	startupSequence: true,
	lastOpenedTweet: null,
	lastOpenedBiggest: null,
	init: function() {
		if (!this.enabled)
			return;
			
		// keep track of the time to tick the tween engine
		this.lastTime = new Date().getTime();
		
		if (Options.stats) {
			// add stats
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			document.body.appendChild(this.stats.domElement);
		}
		
		// add stage
		this.stage = Sprite3D.createCenteredContainer();
		


		// tweet container
		var tweetContainer = document.getElementById("tweet_container2");
		this.image = new Sprite3D(tweetContainer);
		//image.setClassName("analyzed-tweet");
		this.image.setRegistrationPoint( 300, 150, 550 );
		this.image.rotateX( 20 );
		//this.image.x = 100;
	//	this.image.rotateX(10);
		//this.image.z = 500;
		this.image.update();
		this.stage.addChild( this.image );
		
		// biggest word
		//var biggest = $(".p-biggest")[0];
		var biggest = document.getElementById("tweet_biggest_container");
		this.pbiggest = new Sprite3D(biggest); //TODO fix
		this.pbiggest.setRegistrationPoint(300,-100,500);
		this.pbiggest.moveZ(200);
		this.pbiggest.update();
		this.image.addChild(this.pbiggest);
		
		
		// triangles
		var trianglesContainer = document.getElementById("svg-triangles-container");
	/*	this.triangles = new Sprite3D(trianglesContainer);
		this.triangles.setRegistrationPoint( 0, 0, 1000 ); //this.triangles.setRegistrationPoint( 0, 0, 500 );
		//this.triangles.rotateY(5);
		//this.triangles.moveZ(3);
		this.triangles.update();
		this.stage.addChild(this.triangles);*/
		trianglesContainer.style.opacity = "1";
		
		// animate tween tweet
		Tween.get(this.image).to({
			x: Math.abs(Math.floor( Math.random() * 10 - 5) + 5),
			rotationX: Math.abs(Math.round( Math.random() ) * 30),
			z: 500,
			moveZ: 1000,
		},1500, Easing.Exponential.EaseInOut).call(this.moveAgain);
		
		//this.moveAgain();
		
		// follow cursor
		if (Options.cursor) {
			new Cursor().addMovementListener((function(delta){
				anim.image.rotateY(delta.x/10);
				anim.image.rotateX(delta.y/10);
			//	anim.triangles.rotateX(delta.y/100);
			//	anim.triangles.rotateY(delta.x/150);
			}).bind(this));
		}
		
		this.animate();
	},
	moveAgain: function() {
		console.log("tween finished");
		anim.startupSequence = false;
	},
	animate: function() {
		requestAnimationFrame( anim.animate );
		anim.update();
		
		if (Options.stats)
			anim.stats.update();
	},
	update: function() {
		// manually compute the elapsed time since last screen refresh,
		// achieving time-based rather than frame-based animation 
		var newTime = new Date().getTime();
		Tween.tick( newTime - anim.lastTime );
		anim.lastTime = newTime;
		
		var z = anim.image.z;
		var y = anim.image.rotationY;

		if (z > 1000)
			return;
	
		if (anim.startupSequence && y > -30 && y < 30) {
			anim.counterX += 0.0001;
			anim.counterY -= 0.0003;
			anim.image.rotateY(anim.counterX * anim.counterY);
		}
		
		
		// update all stage's children at once
		anim.stage.updateChildrenAll();
	}
};



