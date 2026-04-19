/**
 * ==============================================================================
 * GCC 2026 - TITANIUM ENGINE (WEBGL + ENTERPRISE LOGIC SUITE)
 * Controller: Jakob Fensom | Referee: Lukas Kozak
 * * DESCRIPTION:
 * This is the uncompressed, monolithic logic core for the Gold Coast Cup 2026.
 * It handles 3D WebGL rendering (Apple-style interactive backgrounds), dynamic
 * scroll-based typography shading, form validation, real-time search filtering,
 * and data compilation for the Python backend and Zermelo/Spreadsheet exports.
 * ==============================================================================
 */

const Engine = (() => {

    // ==========================================================================
    // 1. UNABRIDGED AUSTRALIAN CLUB REGISTRY
    // Formatted strictly for precise search filtering and data validation.
    // ==========================================================================
    const CLUBS = [
        "Adelaide Table Tennis Club",
        "Albert Park Table Tennis",
        "Albury-Wodonga Table Tennis",
        "Alice Springs Association",
        "Ararat Table Tennis Association",
        "Armidale Club",
        "Ashmore Table Tennis",
        "Atherton Table Tennis",
        "Bairnsdale Table Tennis",
        "Ballarat Table Tennis Club",
        "Balwyn Table Tennis",
        "Barossa Valley Table Tennis",
        "Bathurst Association",
        "Bayside Table Tennis",
        "Belconnen Club",
        "Bellbird Table Tennis",
        "Bendigo Association",
        "Berwick Table Tennis",
        "Blackburn Table Tennis",
        "Blue Mountains Table Tennis",
        "Box Hill Table Tennis",
        "Brisbane Table Tennis Association",
        "Broadbeach Table Tennis",
        "Broken Hill Table Tennis",
        "Bundaberg District",
        "Burleigh Heads TT",
        "Busselton Table Tennis",
        "Cairns Association",
        "Camberwell Table Tennis",
        "Canberra Association",
        "Cardiff Table Tennis",
        "Central Coast TT",
        "Cherrybrook Club",
        "Coburg Club",
        "Coffs Harbour TT",
        "Coolangatta TT Club",
        "Croydon Table Tennis",
        "Dandenong Association",
        "Darwin Association",
        "Diamond Valley TT",
        "Doncaster Table Tennis",
        "Dubbo Table Tennis",
        "East Gippsland TT",
        "Eastern Suburbs TT",
        "Echuca Table Tennis",
        "Eltham Table Tennis",
        "Epping Table Tennis",
        "Essendon Table Tennis",
        "Fairfield Table Tennis",
        "Ferntree Gully TT",
        "Fremantle Table Tennis",
        "Gatton Table Tennis",
        "Geelong Association",
        "Gladstone Table Tennis",
        "Gold Coast Table Tennis Association",
        "Goulburn Table Tennis",
        "Griffith Table Tennis",
        "Hamilton Table Tennis",
        "Hawthorn Table Tennis",
        "Hobart Club",
        "Hornsby Club",
        "Horsham Table Tennis",
        "Hurstville Table Tennis",
        "Illawarra Club",
        "Ipswich Association",
        "Ivanhoe Table Tennis",
        "Kew Table Tennis",
        "Kilsyth Table Tennis",
        "Knox Table Tennis",
        "Launceston Table Tennis",
        "Lismore Table Tennis",
        "Logan City TT",
        "Macedon Ranges TT",
        "Mackay Table Tennis",
        "Maitland TT",
        "Malvern Table Tennis",
        "Manly Warringah TT",
        "Manningham Club",
        "Maryborough Club",
        "Melbourne Table Tennis Club",
        "Melton Table Tennis",
        "Mildura Table Tennis",
        "Mitcham Table Tennis",
        "Monash University TT",
        "Mooroolbark Table Tennis",
        "Mornington Peninsula TT",
        "Mount Gambier TT",
        "Mount Waverley TT",
        "Namoi Table Tennis",
        "Newcastle Club",
        "Noosa Association",
        "North West Tasmania TT",
        "Nunawading Table Tennis",
        "Oakleigh Table Tennis",
        "Orange Table Tennis",
        "Parramatta Table Tennis",
        "Payneham Club",
        "Perth Club",
        "Port Lincoln Table Tennis",
        "Port Macquarie TT",
        "Queanbeyan Table Tennis",
        "Ringwood Table Tennis",
        "Robina Table Tennis Club",
        "Rockhampton Association",
        "Sale Table Tennis",
        "Shepparton Table Tennis",
        "South Australian TT",
        "South Perth Table Tennis",
        "Southport TT Club",
        "St George Club",
        "St Kilda Table Tennis",
        "Star Table Tennis",
        "Sunbury TT",
        "Sunshine Coast TT",
        "Swan Hill Table Tennis",
        "Sydney Northern Districts",
        "Tamworth Table Tennis",
        "Toowoomba Association",
        "Townsville Association",
        "Traralgon Table Tennis",
        "Tuggeranong Table Tennis",
        "University of Queensland TT",
        "Wagga Wagga Association",
        "Wangaratta Table Tennis",
        "Warrnambool Table Tennis",
        "Waverley Table Tennis",
        "Werribee Table Tennis",
        "Western Suburbs TT",
        "Wodonga Table Tennis",
        "Wollongong Association",
        "Wynnum Association",
        "Wyong Club",
        "Yarra Valley TT"
    ];

    // ==========================================================================
    // 2. WEBGL KINETIC PHYSICS ENGINE
    // Uses Three.js to render a mathematically accurate, interactive 3D particle 
    // nebula that reacts to cursor movement and mobile touch events.
    // ==========================================================================
    const WebGLEngine = {
        scene: null,
        camera: null,
        renderer: null,
        particles: null,
        targetX: 0,
        targetY: 0,
        windowHalfX: window.innerWidth / 2,
        windowHalfY: window.innerHeight / 2,

        init: function() {
            const container = document.getElementById('webgl-container');
            if (!container) {
                console.error("WebGL Container missing from DOM.");
                return;
            }
            if (!window.THREE) {
                console.error("Three.js library failed to load.");
                return;
            }

            // A. SCENE & CAMERA CONFIGURATION
            this.scene = new THREE.Scene();
            // Exponential fog fades particles into the deep background gracefully
            this.scene.fog = new THREE.FogExp2(0x000000, 0.001);
            
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
            this.camera.position.z = 800;

            // B. GEOMETRIC CALCULATIONS (Torus Knot Particle Field)
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            
            // The base shape is a complex, interwoven knot
            const baseGeo = new THREE.TorusKnotGeometry(300, 100, 150, 20);
            const pos = baseGeo.getAttribute('position');
            
            // Map raw vertices to a particle cloud with mathematical noise added
            for(let i = 0; i < pos.count; i++) {
                const xOffset = (Math.random() - 0.5) * 50;
                const yOffset = (Math.random() - 0.5) * 50;
                const zOffset = (Math.random() - 0.5) * 50;
                
                vertices.push(
                    pos.getX(i) + xOffset,
                    pos.getY(i) + yOffset,
                    pos.getZ(i) + zOffset
                );
            }
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

            // C. MATERIAL & SHADER COMPILATION
            const material = new THREE.PointsMaterial({
                size: 3, 
                color: 0xD4AF37, // Apple Titanium Gold hex
                transparent: true, 
                opacity: 0.5, 
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true
            });

            this.particles = new THREE.Points(geometry, material);
            this.particles.rotation.x = Math.PI / 4;
            this.scene.add(this.particles);

            // D. HARDWARE RENDERER INITIATION
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(this.renderer.domElement);

            this.bindEvents();
            this.animate();
        },

        bindEvents: function() {
            // Mouse Interaction (Desktop)
            document.addEventListener('mousemove', (e) => {
                this.targetX = (e.clientX - this.windowHalfX) * 0.001;
                this.targetY = (e.clientY - this.windowHalfY) * 0.001;
            }, { passive: true });
            
            // Touch Interaction (Mobile)
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    this.targetX = (e.touches[0].clientX - this.windowHalfX) * 0.002;
                    this.targetY = (e.touches[0].clientY - this.windowHalfY) * 0.002;
                }
            }, { passive: true });

            // Responsive Layout Handling
            window.addEventListener('resize', () => {
                this.windowHalfX = window.innerWidth / 2;
                this.windowHalfY = window.innerHeight / 2;
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }, { passive: true });
        },

        animate: function() {
            requestAnimationFrame(this.animate.bind(this));
            this.renderFrame();
        },

        renderFrame: function() {
            // Linear interpolation (Lerp) for smooth rotation following user input
            this.particles.rotation.y += 0.001 + 0.05 * (this.targetX - this.particles.rotation.y);
            this.particles.rotation.x += 0.001 + 0.05 * (this.targetY - this.particles.rotation.x);
            this.renderer.render(this.scene, this.camera);
        }
    };

    // ==========================================================================
    // 3. TYPOGRAPHY LIGHTING ENGINE
    // Maps the scroll depth of the viewport to the background-position of the 
    // CSS linear-gradient, creating a physical "shimmer" effect on the text.
    // ==========================================================================
    const ScrollShading = {
        init: function() {
            const scrollRoot = document.getElementById('scroll-root');
            const goldText = document.getElementById('gold-sync');
            
            if (!scrollRoot || !goldText) {
                console.warn("ScrollShading targets not found in DOM.");
                return;
            }

            scrollRoot.addEventListener('scroll', () => {
                const sTop = scrollRoot.scrollTop;
                const sMax = scrollRoot.scrollHeight - scrollRoot.clientHeight;
                
                if (sMax <= 0) return; // Prevent division by zero
                
                const fraction = sTop / sMax;
                // Shift the gold gradient horizontally up to 200%
                goldText.style.setProperty('--light-x', `${fraction * 200}%`);
            }, { passive: true });
        }
    };

    // ==========================================================================
    // 4. SPREADSHEET COMPILER BRIDGE
    // Sanitizes and formats the raw HTML form data into a strict CSV string
    // structure suitable for backend processing or direct Zermelo ingestion.
    // ==========================================================================
    const DataCompiler = {
        formatRow: function(payload) {
            const timestamp = new Date().toISOString();
            
            // Escape any rogue quotes in user inputs to prevent CSV injection
            const safe = (str) => {
                if (!str) return "";
                return str.toString().replace(/"/g, '""');
            };

            const csvRow = `"${safe(payload.ln)}", "${safe(payload.fn)}", "${safe(payload.rc)}", "${safe(payload.tid)}", "${safe(payload.club)}", "${safe(payload.rcv)}", "${safe(payload.em)}", "${safe(payload.mob)}", "${timestamp}"`;
            
            console.log("=================================================");
            console.log("🟢 ENTERPRISE BRIDGE: DATA COMPILED");
            console.log("Payload String -> ", csvRow);
            console.log("=================================================");
            
            return csvRow;
        }
    };

    // ==========================================================================
    // 5. DOM CONTROLLER & VALIDATION LOGIC
    // The public API exposed to the HTML file for interaction routing.
    // ==========================================================================
    return {
        /**
         * Orchestrates transitions between logical views.
         * Utilizes CSS keyframe animations defined in index.html.
         * @param {string} targetId - The DOM ID of the view to switch to.
         */
        switchView: function(targetId) {
            const views = document.querySelectorAll('.v-screen');
            views.forEach(el => el.classList.remove('active'));
            
            // Allow DOM to process removal before adding active class to trigger animation
            setTimeout(() => {
                const target = document.getElementById(targetId);
                if (target) {
                    target.classList.add('active');
                    document.getElementById('scroll-root').scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 50);
        },

        /**
         * Real-time search filtering against the CLUBS constant.
         * @param {string} query - The raw string from the input field.
         */
        search: function(query) {
            const portal = document.getElementById('club-portal');
            const normalizedQuery = query.toLowerCase().trim();
            
            portal.innerHTML = "";
            
            if (normalizedQuery.length < 2) { 
                portal.style.display = "none"; 
                return; 
            }
            
            const matches = CLUBS.filter(clubName => clubName.toLowerCase().includes(normalizedQuery));
            
            if (matches.length > 0) {
                portal.style.display = "block";
                matches.forEach(match => {
                    const row = document.createElement('div'); 
                    row.className = "s-row"; 
                    row.innerText = match;
                    row.onclick = () => { 
                        document.getElementById('club-inp').value = match; 
                        portal.style.display = "none"; 
                    };
                    portal.appendChild(row);
                });
            } else { 
                portal.style.display = "none"; 
            }
        },

        /**
         * Comprehensive client-side validation suite.
         * Triggers CSS shake animations on invalid nodes.
         * @returns {boolean} - True if all tests pass, false otherwise.
         */
        validateForm: function() {
            // Retrieve DOM Nodes
            const nodes = {
                fn: document.getElementById('fn'), 
                ln: document.getElementById('ln'), 
                club: document.getElementById('club-inp'),
                tid: document.getElementById('tid'), 
                rc: document.getElementById('rc-id'), 
                rcv: document.getElementById('rc-val'),
                mob: document.getElementById('mob'), 
                e1: document.getElementById('e1'), 
                e2: document.getElementById('e2')
            };
            
            const tcNode = document.getElementById('tc-agree');
            const errorLabels = { 
                id: document.getElementById('err-id'), 
                tel: document.getElementById('err-tel'), 
                em: document.getElementById('err-em') 
            };
            
            let isFormValid = true;
            
            // Reset UI State
            Object.values(nodes).forEach(el => {
                if(el) el.classList.remove('shake');
            });
            if(tcNode) tcNode.classList.remove('shake');
            Object.values(errorLabels).forEach(el => {
                if(el) el.style.display = 'none';
            });

            // 1. Check Mandatory Fields (Names & IDs)
            const requiredFields = [nodes.fn, nodes.ln, nodes.tid, nodes.rc, nodes.rcv];
            requiredFields.forEach(el => { 
                if(!el.value.trim()) {
                    el.classList.add('shake');
                    isFormValid = false;
                }
            });
            if (!nodes.tid.value || !nodes.rc.value || !nodes.rcv.value) {
                errorLabels.id.style.display = "block";
            }

            // 2. Validate Australian Mobile Formatting (Regex strict check)
            const mobileStr = nodes.mob.value.replace(/\s/g, "");
            const mobileRegex = /^(?:\+614|04)\d{8}$/;
            if (!mobileRegex.test(mobileStr)) {
                nodes.mob.classList.add('shake'); 
                errorLabels.tel.style.display = "block"; 
                isFormValid = false;
            }

            // 3. Email Consistency Check
            const email1 = nodes.e1.value.toLowerCase().trim();
            const email2 = nodes.e2.value.toLowerCase().trim();
            if (email1 !== email2 || !email1 || !email1.includes('@')) {
                nodes.e1.classList.add('shake'); 
                nodes.e2.classList.add('shake'); 
                errorLabels.em.style.display = "block"; 
                isFormValid = false;
            }

            // 4. Validate Legal Agreement
            if (!tcNode.checked) { 
                tcNode.classList.add('shake'); 
                isFormValid = false; 
            }

            // 5. Compile Data if Valid
            if (isFormValid) {
                DataCompiler.formatRow({
                    fn: nodes.fn.value, 
                    ln: nodes.ln.value, 
                    club: nodes.club.value || "Independent",
                    tid: nodes.tid.value, 
                    rc: nodes.rc.value, 
                    rcv: nodes.rcv.value,
                    mob: nodes.mob.value, 
                    em: email1
                });
            }
            
            return isFormValid;
        },

        /**
         * Form submission handler. Validates data, provides haptic feedback, 
         * and routes payload to the Python backend infrastructure.
         */
        submit: function() {
            if (this.validateForm()) {
                // Success Haptic (If supported)
                if (navigator.vibrate) navigator.vibrate(30);
                
                // Construct the JSON payload for the Flask Server
                const payload = {
                    firstName: document.getElementById('fn').value.trim(),
                    lastName: document.getElementById('ln').value.trim(),
                    natId: document.getElementById('tid').value.trim(),
                    rcId: document.getElementById('rc-id').value.trim(),
                    rcPoints: document.getElementById('rc-val').value.trim(),
                    club: document.getElementById('club-inp').value.trim() || "Independent",
                    mobile: document.getElementById('mob').value.trim(),
                    email: document.getElementById('e1').value.trim()
                };

                // Dispatch to the backend vault (Port 8080 as configured in server.py)
                fetch('http://127.0.0.1:8080/api/register', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "checkout") {
                        // Backend generated a Stripe URL successfully
                        window.location.href = data.url; 
                    } else if (data.status === "waitlist") {
                        // Backend determined capacity is full
                        alert(data.message);
                    } else {
                        // Backend threw an internal error
                        alert("System Error: " + data.error);
                    }
                })
                .catch(err => {
                    console.error("Critical Fetch Failure: Backend offline or unreachable.", err);
                    alert("System Offline. Please ensure server.py is actively running on Port 8080.");
                });
                
            } else {
                // Error Haptic Pattern (If supported)
                if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
            }
        },

        /**
         * Initialization sequence for the entire engine.
         */
        boot: function() {
            console.log("INITIALIZING GCC 2026 TITANIUM ENGINE...");
            WebGLEngine.init();
            ScrollShading.init();
            console.log("ENGINE STATUS: ONLINE AND READY.");
        }
    };
})();

// Execute boot sequence when the DOM is fully parsed
window.addEventListener('DOMContentLoaded', Engine.boot);