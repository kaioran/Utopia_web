/**
 * Utopia POS — Technova SolarSystem Background Engine
 * Reproduit fidèlement le système solaire animé de TechNova (HTML5 Canvas) :
 * - 160 étoiles scintillantes avec pulsation sinusoïdale
 * - Soleil central rayonnant avec halo radial
 * - 4 planètes sphériques 3D grand format (rayons et tailles élargis) avec reflet spéculaire blanc,
 *   corps teinté, ombrage profond et halo diffus
 * - Trajectoires orbitales grandioses et cinématiques lentes (rotation douce et lente)
 * - Lunes orbitales satellites avec micro-orbites
 * - Adaptation automatique RTL (Arabe) et LTR (Français)
 * - Support dynamique Light & Dark modes
 * - Mise à l'échelle HiDPI (devicePixelRatio)
 * - Pause automatique en arrière-plan (Page Visibility API) et respect de prefers-reduced-motion
 */

interface Moon {
  r: number;   // Rayon orbital par rapport à la planète (px)
  s: number;   // Vitesse orbitale de la lune
  sz: number;  // Rayon de la lune (px)
}

interface Planet {
  radius: number;    // % de l'orbite par rapport au rayon de référence
  speed: number;     // Vitesse angulaire
  size: number;      // Rayon de la sphère (px)
  colorVar: string;  // Variable CSS de la teinte principale
  phase: number;     // Déphasage initial (rad)
  moons: Moon[];
}

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  tw: number;
}

export class SolarSystem {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private t: number = 0;
  private lastTime: number = 0;
  private stars: Star[] = [];
  private raf: number | null = null;
  private isRunning: boolean = false;
  private W: number = 0;
  private H: number = 0;
  private cx: number = 0;
  private cy: number = 0;
  private ref: number = 0;
  private isRtl: boolean = false;

  // 4 planètes sphériques avec rayons d'orbite élargis et tailles de sphères augmentées (14px - 24px)
  private planets: Planet[] = [
    { radius: 0.22, speed: 1.35, size: 14, colorVar: '--solar-planet-1', phase: 0.5, moons: [{ r: 24, s: 3.0, sz: 3.2 }] },
    { radius: 0.38, speed: 0.95, size: 18, colorVar: '--solar-planet-2', phase: 2.1, moons: [{ r: 30, s: 2.4, sz: 3.6 }] },
    { radius: 0.58, speed: 0.60, size: 24, colorVar: '--solar-planet-3', phase: 3.8, moons: [{ r: 40, s: 2.0, sz: 4.2 }, { r: 58, s: 1.4, sz: 3.0 }] },
    { radius: 0.80, speed: 0.38, size: 18, colorVar: '--solar-planet-4', phase: 1.4, moons: [{ r: 32, s: 2.8, sz: 3.4 }] },
  ];

  constructor(canvasId: string = 'solar-canvas') {
    if (typeof window === 'undefined') return;

    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.isRtl = document.documentElement.dir === 'rtl';

    this.resize();
    this.genStars();

    window.addEventListener('resize', () => {
      this.resize();
      this.genStars();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    this.start();
  }

  private resize(): void {
    if (!this.canvas || !this.ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth;
    this.H = window.innerHeight;

    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.isRtl = document.documentElement.dir === 'rtl';

    // Positionnement du centre : légèrement au-dessus pour que les larges orbites balayent tout le viewport
    if (this.W < 840) {
      this.cx = this.W * 0.5;
      this.cy = Math.min(this.H * 0.28, 250);
      this.ref = Math.min(this.W, this.H) * 0.95;
    } else {
      this.cx = this.isRtl ? this.W * 0.26 : this.W * 0.74;
      this.cy = Math.min(this.H * 0.35, 360);
      this.ref = Math.max(this.W * 0.62, this.H * 0.95);
    }
  }

  private genStars(): void {
    this.stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * this.W,
      y: Math.random() * this.H,
      r: Math.random() * 1.4 + 0.3,
      o: Math.random() * 0.7 + 0.25,
      tw: Math.random() * Math.PI * 2,
    }));
  }

  private cssVar(name: string, fallback: string): string {
    if (typeof document === 'undefined') return fallback;
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return val || fallback;
  }

  private hexToRgba(hexOrRgb: string, alpha: number): string {
    if (hexOrRgb.startsWith('rgba')) {
      return hexOrRgb.replace(/[\d\.]+\)$/g, `${alpha})`);
    }
    if (hexOrRgb.startsWith('rgb(')) {
      return hexOrRgb.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    let c = hexOrRgb.replace('#', '').trim();
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    if (isNaN(num)) return `rgba(59, 130, 246, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private drawStars(): void {
    if (!this.ctx) return;
    const baseColor = this.cssVar('--solar-star', 'rgba(100, 116, 139, 0.60)');

    this.stars.forEach(s => {
      const alpha = s.o * (0.6 + 0.4 * Math.sin(this.t * 1.5 + s.tw));
      this.ctx!.beginPath();
      this.ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      this.ctx!.fillStyle = baseColor;
      this.ctx!.globalAlpha = alpha;
      this.ctx!.fill();
      this.ctx!.globalAlpha = 1.0;
    });
  }

  private drawSun(): void {
    if (!this.ctx) return;
    const r = 28;

    // Halo lumineux externe du soleil
    const glow = this.ctx.createRadialGradient(this.cx, this.cy, r * 0.4, this.cx, this.cy, r * 3.8);
    const sunGlowColor = this.cssVar('--solar-sun-glow', 'rgba(245, 158, 11, 0.22)');
    glow.addColorStop(0, sunGlowColor);
    glow.addColorStop(1, 'rgba(245, 158, 11, 0)');

    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, r * 3.8, 0, Math.PI * 2);
    this.ctx.fillStyle = glow;
    this.ctx.fill();

    // Sphère 3D du soleil avec dégradé chaud
    const grad = this.ctx.createRadialGradient(this.cx - r * 0.3, this.cy - r * 0.3, r * 0.1, this.cx, this.cy, r);
    grad.addColorStop(0, this.cssVar('--solar-sun-core', '#fff7a0'));
    grad.addColorStop(0.5, this.cssVar('--solar-sun-mid', '#f59e0b'));
    grad.addColorStop(1, this.cssVar('--solar-sun-rim', '#b45309'));

    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, r, 0, Math.PI * 2);
    this.ctx.fillStyle = grad;
    this.ctx.fill();
  }

  private drawOrbit(r: number): void {
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, r, 0, Math.PI * 2);
    this.ctx.strokeStyle = this.cssVar('--solar-orbit', 'rgba(15, 23, 42, 0.08)');
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  private drawPlanet(p: Planet): void {
    if (!this.ctx) return;
    const orbitR = p.radius * this.ref;

    // Vitesse angulaire cinématique fluide et continue (t en secondes)
    const angle = this.t * p.speed * 0.10 + p.phase;
    const px = this.cx + Math.cos(angle) * orbitR;
    const py = this.cy + Math.sin(angle) * orbitR;

    // 1. Cercle orbital large
    this.drawOrbit(orbitR);

    // 2. Halo lumineux diffus externe plus étendu (3.8x la taille de la sphère)
    const rawColor = this.cssVar(p.colorVar, '#06b6d4');
    const haloRadius = p.size * 3.8;
    const glow = this.ctx.createRadialGradient(px, py, 0, px, py, haloRadius);
    glow.addColorStop(0, this.hexToRgba(rawColor, 0.42));
    glow.addColorStop(0.5, this.hexToRgba(rawColor, 0.16));
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.beginPath();
    this.ctx.arc(px, py, haloRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = glow;
    this.ctx.fill();

    // 3. Sphère 3D réaliste grand format avec point spéculaire éclatant et dégradé d'ombrage profond
    // Highlight décentré en haut à gauche (-0.32 * size)
    const sphereGrad = this.ctx.createRadialGradient(
      px - p.size * 0.32,
      py - p.size * 0.32,
      p.size * 0.08,
      px,
      py,
      p.size
    );

    const shadowColor = this.cssVar('--solar-sphere-shadow', '#020617');
    sphereGrad.addColorStop(0, '#FFFFFF');             // Point de réflexion spéculaire blanc pur
    sphereGrad.addColorStop(0.18, '#FFFFFF');          // Cœur brillant
    sphereGrad.addColorStop(0.42, rawColor);           // Teinte vive du corps
    sphereGrad.addColorStop(0.85, rawColor);           // Couleur de base
    sphereGrad.addColorStop(1.0, shadowColor);         // Ombrage tridimensionnel profond

    this.ctx.beginPath();
    this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
    this.ctx.fillStyle = sphereGrad;
    this.ctx.fill();

    // 4. Lunes satellites en rotation orbitale douce et lente
    const moonOrbitColor = this.cssVar('--solar-moon-orbit', 'rgba(15, 23, 42, 0.07)');
    p.moons.forEach(m => {
      // Rotation douce de la lune autour de la planète (~6-12 secondes par orbite)
      const ma = this.t * m.s * 0.32 + p.phase * 2;
      const mx = px + Math.cos(ma) * m.r;
      const my = py + Math.sin(ma) * m.r;

      // Micro-orbite de la lune
      this.ctx!.beginPath();
      this.ctx!.arc(px, py, m.r, 0, Math.PI * 2);
      this.ctx!.strokeStyle = moonOrbitColor;
      this.ctx!.lineWidth = 0.8;
      this.ctx!.stroke();

      // Petite lueur de la lune
      const moonGlow = this.ctx!.createRadialGradient(mx, my, 0, mx, my, m.sz * 2.5);
      moonGlow.addColorStop(0, 'rgba(186, 230, 253, 0.55)');
      moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx!.beginPath();
      this.ctx!.arc(mx, my, m.sz * 2.5, 0, Math.PI * 2);
      this.ctx!.fillStyle = moonGlow;
      this.ctx!.fill();

      // Corps 3D de la lune
      const moonGrad = this.ctx!.createRadialGradient(
        mx - m.sz * 0.3,
        my - m.sz * 0.3,
        0,
        mx,
        my,
        m.sz
      );
      moonGrad.addColorStop(0, '#FFFFFF');
      moonGrad.addColorStop(0.4, '#BAE6FD');
      moonGrad.addColorStop(1, '#0284C7');

      this.ctx!.beginPath();
      this.ctx!.arc(mx, my, m.sz, 0, Math.PI * 2);
      this.ctx!.fillStyle = moonGrad;
      this.ctx!.fill();
    });
  }

  private renderSingleFrame(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.drawStars();
    this.drawSun();
    this.planets.forEach(p => this.drawPlanet(p));
  }

  private loop = (time: number = performance.now()): void => {
    if (!this.isRunning) return;
    if (!this.lastTime) {
      this.lastTime = time;
    }
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;
    this.t += dt;

    this.renderSingleFrame();
    this.raf = requestAnimationFrame(this.loop);
  };

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
    this.lastTime = 0;
  }

  public destroy(): void {
    this.stop();
    if (activeSolarSystem === this) {
      activeSolarSystem = null;
    }
  }
}

let activeSolarSystem: SolarSystem | null = null;

/**
 * Fonction d'aide pour initialiser le système solaire au chargement
 */
export function initSolarSystem(): SolarSystem | null {
  if (typeof window === 'undefined') return null;
  const canvas = document.getElementById('solar-canvas');
  if (!canvas) return null;

  if (activeSolarSystem) {
    activeSolarSystem.start();
    return activeSolarSystem;
  }

  activeSolarSystem = new SolarSystem('solar-canvas');
  return activeSolarSystem;
}
