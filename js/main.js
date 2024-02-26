readImage();
async function readImage() {
	noise.seed( Date.now() );

	const img = new Image;
	img.src = "../img/4M3A9543.jpg";
	await img.decode();

	const app = new PIXI.Application( {
		backgroundColor: 0x000000,
		resolution: window.devicePixelRatio,
		resizeTo: window,
	} );

	document.body.appendChild( app.view );
	app.view.style.width  = "100%";
	app.view.style.height = "100%";

	const DOT_SIZE = 2;

	const imgW = img.width;
	const imgH = img.height;
	const lengthW = imgW / DOT_SIZE;
	const lengthH = imgH / DOT_SIZE;

	const container = new PIXI.ParticleContainer( lengthW * lengthH, {
		scale: true,
		position: true
	} );

	app.stage.addChild( container );

	const texture = PIXI.Texture.from( img );

	const canvas  = document.createElement( "canvas" );
	canvas.width  = imgW;
	canvas.height = imgH;
	const ctx = canvas.getContext( "2d", {
		willReadFrequentyly: true,
	} );
	ctx.drawImage( img, 0, 0 );

	// ----------------------------------------------
	// Make particle
	// ----------------------------------------------
	const dots = [];

	for( let i = 0; i < lengthW * lengthH; i++ ) {
		const x = i % lengthW * DOT_SIZE;
		const y = Math.floor( i / lengthW ) * DOT_SIZE;

		const dotData = ctx.getImageData(
			x + Math.floor( DOT_SIZE / 2 ),
			y + Math.floor( DOT_SIZE / 2 ),
			1,
			1
		);

		const texture2 = new PIXI.Texture (
			texture,
			new PIXI.Rectangle( x, y, DOT_SIZE, DOT_SIZE ),
		);

		const dot = new Dot( texture2 );
		dot.anchor.set( 0.5 );
		dot.x = x - imgW / 2;
		dot.y = y - imgH / 2;
		dot.offsetIndex = 1;
		container.addChild( dot );

		dots.push( dot );


		// ----------------------------------------------
		// Mounting motion
		// ----------------------------------------------
		const tl = gsap.timeline ( {
			repeat: -1
		} );

		for( let i = 0; i < dots.length; i++ ) {
			const dot = dots[i];
			const index = dot.offsetIndex;
			const nx = ( index % lengthW ) / lengthW;
			const ny = Math.floor( index / lengthW ) / lengthH;

			const px = noise.perlin2( nx * 4, ny * 3 );
			const py = noise.perlin2( nx * 3, ny * 2 );

			const baseDelay = ( dot.offsetIndex % lengthW ) * 0.001 + Math.random() * 0.2;
			const perlinAmpX = 1500 * ( nx * 2 + 1 );
			const perlinAmpY = 500 * ( nx * 2 + 1 );
			const randomAmp = 10 * ( nx * 2 + 1 );

			const scale = nx * 3 + 1;

			tl.from (
				dot,
				{
					x: "-=" + ( perlinAmpX * px + randomAmp * ( Math.random() - 0.5 ) ),
					y: "-=" + ( perlinAmpY * py + randomAmp * ( Math.random() - 0.5 ) ),
					alpha: 0,
					scaleX: scale,
					scaleY: scale,
					duration: 2,
					ease: "expo.inOut",
				},
				"-2",
			);
		}

		tl.fromTo (
			container.scale,
			{ x: 0.4, y: 0.4 },
			{ x: 0.5, y: 0.5, duration: 5, ease: "none" },
			0
		);

		const resize = () => {
			container.x = app.screen.width / 2;
			container.y = app.screen.height / 2;
		};
		window.addEventListener( "resize", resize );
		resize();
	}

}

// ----------------------------------------------
// Particle class
// ----------------------------------------------
class Dot extends PIXI.Sprite {
	constructor( texture ) {
		super( texture );
	}
	get scaleX() {
		return this.scale.x;
	}
	set scaleX( value ) {
		this.scale.x = value;
	}
	get scaleY() {
		return this.scale.y;
	}
	set scaleY( value ) {
		this.scale.y = value;
	}
	offsetIndex = -1;
}