/**
 * Animates multiple large, intersecting, chaotic but rhythmic breathing curves as a background.
 * Each curve is defined by several control points oscillating independently, interpolated smoothly.
 */
(function() {
  const canvas = document.getElementById('calmWaveform');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const duration = 140; // seconds per breath cycle (10x slower)
  const NUM_CURVES = 3;
  const POINTS_PER_CURVE = 5;
  // Remove COLORS array, use PASTEL_COLORS from color.js
  const LINE_WIDTH = 7; // uniform thickness for all curves

  // Generate random parameters for each control point of each curve
  const curveParams = Array.from({length: NUM_CURVES}, (_, i) =>
    Array.from({length: POINTS_PER_CURVE}, (_, j) => ({
      base: 0.5 + 0.25 * (Math.random() - 0.5), // base y as fraction of height
      amp: 0.48 + 0.35 * Math.random(),         // amplitude as fraction of height (much larger)
      freq: 0.2 + 0.3 * Math.random(),          // local frequency (much slower)
      phase: Math.random() * Math.PI * 2        // local phase
    }))
  );

  // Generate random color for each curve from PASTEL_COLORS
  const curveColors = Array.from({length: NUM_CURVES}, () =>
    PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]
  );

  // Catmull-Rom interpolation
  function catmullRom(p0, p1, p2, p3, t) {
    return 0.5 * ((2 * p1) + (-p0 + p2) * t +
      (2*p0 - 5*p1 + 4*p2 - p3) * t * t +
      (-p0 + 3*p1 - 3*p2 + p3) * t * t * t);
  }

  function drawBreathCurves(globalPhase, t) {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    for (let c = 0; c < NUM_CURVES; ++c) {
      const params = curveParams[c];
      // Calculate control points
      const points = params.map((p, i) => {
        // Each point oscillates with its own freq/phase, modulated by global breath
        const local = Math.sin(globalPhase + p.phase + t * p.freq);
        const y = height * (p.base + p.amp * local * Math.sin(globalPhase));
        const x = (width / (POINTS_PER_CURVE - 1)) * i;
        return {x, y};
      });
      // Add virtual points at ends for Catmull-Rom
      const pts = [points[0], ...points, points[points.length-1]];
      ctx.beginPath();
      ctx.moveTo(pts[1].x, pts[1].y);
      for (let i = 1; i < pts.length - 2; i++) {
        for (let t = 0; t < 1; t += 0.04) {
          const x = catmullRom(pts[i-1].x, pts[i].x, pts[i+1].x, pts[i+2].x, t);
          const y = catmullRom(pts[i-1].y, pts[i].y, pts[i+1].y, pts[i+2].y, t);
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = curveColors[c % curveColors.length];
      ctx.lineWidth = LINE_WIDTH;
      ctx.shadowColor = curveColors[c % curveColors.length];
      ctx.shadowBlur = 12 - c * 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = performance.now() / 1000;
    const globalPhase = (now % duration) / duration * 2 * Math.PI;
    drawBreathCurves(globalPhase, now);
    requestAnimationFrame(animate);
  }

  animate();
})(); 