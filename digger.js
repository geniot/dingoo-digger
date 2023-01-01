(function() {
        var t = t || {};
        t.scope = {};
        t.ASSUME_ES5 = !1;
        t.ASSUME_NO_NATIVE_MAP = !1;
        t.ASSUME_NO_NATIVE_SET = !1;
        t.SIMPLE_FROUND_POLYFILL = !1;
        t.ISOLATE_POLYFILLS = !1;
        t.FORCE_POLYFILL_PROMISE = !1;
        t.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
        t.defineProperty = t.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(d, n, x) {
            if (d == Array.prototype || d == Object.prototype)
                return d;
            d[n] = x.value;
            return d
        }
        ;
        t.getGlobal = function(d) {
            d = ["object" == typeof globalThis && globalThis, d, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
            for (var n = 0; n < d.length; ++n) {
                var x = d[n];
                if (x && x.Math == Math)
                    return x
            }
            throw Error("Cannot find global object");
        }
        ;
        t.global = t.getGlobal(this);
        t.IS_SYMBOL_NATIVE = "function" === typeof Symbol && "symbol" === typeof Symbol("x");
        t.TRUST_ES6_POLYFILLS = !t.ISOLATE_POLYFILLS || t.IS_SYMBOL_NATIVE;
        t.polyfills = {};
        t.propertyToPolyfillSymbol = {};
        t.POLYFILL_PREFIX = "$jscp$";
        t.polyfill = function(d, n, x, q) {
            n && (t.ISOLATE_POLYFILLS ? t.polyfillIsolated(d, n, x, q) : t.polyfillUnisolated(d, n, x, q))
        }
        ;
        t.polyfillUnisolated = function(d, n) {
            var x = t.global;
            d = d.split(".");
            for (var q = 0; q < d.length - 1; q++) {
                var p = d[q];
                if (!(p in x))
                    return;
                x = x[p]
            }
            d = d[d.length - 1];
            q = x[d];
            n = n(q);
            n != q && null != n && t.defineProperty(x, d, {
                configurable: !0,
                writable: !0,
                value: n
            })
        }
        ;
        t.polyfillIsolated = function(d, n, x) {
            var q = d.split(".");
            d = 1 === q.length;
            var p = q[0];
            p = !d && p in t.polyfills ? t.polyfills : t.global;
            for (var z = 0; z < q.length - 1; z++) {
                var E = q[z];
                if (!(E in p))
                    return;
                p = p[E]
            }
            q = q[q.length - 1];
            x = t.IS_SYMBOL_NATIVE && "es6" === x ? p[q] : null;
            n = n(x);
            null != n && (d ? t.defineProperty(t.polyfills, q, {
                configurable: !0,
                writable: !0,
                value: n
            }) : n !== x && (void 0 === t.propertyToPolyfillSymbol[q] && (d = 1E9 * Math.random() >>> 0,
                t.propertyToPolyfillSymbol[q] = t.IS_SYMBOL_NATIVE ? t.global.Symbol(q) : t.POLYFILL_PREFIX + d + "$" + q),
                t.defineProperty(p, t.propertyToPolyfillSymbol[q], {
                    configurable: !0,
                    writable: !0,
                    value: n
                })))
        }
        ;
        t.underscoreProtoCanBeSet = function() {
            var d = {
                a: !0
            }
                , n = {};
            try {
                return n.__proto__ = d,
                    n.a
            } catch (x) {}
            return !1
        }
        ;
        t.setPrototypeOf = t.TRUST_ES6_POLYFILLS && "function" == typeof Object.setPrototypeOf ? Object.setPrototypeOf : t.underscoreProtoCanBeSet() ? function(d, n) {
                d.__proto__ = n;
                if (d.__proto__ !== n)
                    throw new TypeError(d + " is not extensible");
                return d
            }
            : null;
        t.arrayIteratorImpl = function(d) {
            var n = 0;
            return function() {
                return n < d.length ? {
                    done: !1,
                    value: d[n++]
                } : {
                    done: !0
                }
            }
        }
        ;
        t.arrayIterator = function(d) {
            return {
                next: t.arrayIteratorImpl(d)
            }
        }
        ;
        t.makeIterator = function(d) {
            var n = "undefined" != typeof Symbol && Symbol.iterator && d[Symbol.iterator];
            return n ? n.call(d) : t.arrayIterator(d)
        }
        ;
        t.generator = {};
        t.generator.ensureIteratorResultIsObject_ = function(d) {
            if (!(d instanceof Object))
                throw new TypeError("Iterator result " + d + " is not an object");
        }
        ;
        t.generator.Context = function() {
            this.isRunning_ = !1;
            this.yieldAllIterator_ = null;
            this.yieldResult = void 0;
            this.nextAddress = 1;
            this.finallyAddress_ = this.catchAddress_ = 0;
            this.finallyContexts_ = this.abruptCompletion_ = null
        }
        ;
        t.generator.Context.prototype.start_ = function() {
            if (this.isRunning_)
                throw new TypeError("Generator is already running");
            this.isRunning_ = !0
        }
        ;
        t.generator.Context.prototype.stop_ = function() {
            this.isRunning_ = !1
        }
        ;
        t.generator.Context.prototype.jumpToErrorHandler_ = function() {
            this.nextAddress = this.catchAddress_ || this.finallyAddress_
        }
        ;
        t.generator.Context.prototype.next_ = function(d) {
            this.yieldResult = d
        }
        ;
        t.generator.Context.prototype.throw_ = function(d) {
            this.abruptCompletion_ = {
                exception: d,
                isException: !0
            };
            this.jumpToErrorHandler_()
        }
        ;
        t.generator.Context.prototype.return = function(d) {
            this.abruptCompletion_ = {
                return: d
            };
            this.nextAddress = this.finallyAddress_
        }
        ;
        t.generator.Context.prototype.jumpThroughFinallyBlocks = function(d) {
            this.abruptCompletion_ = {
                jumpTo: d
            };
            this.nextAddress = this.finallyAddress_
        }
        ;
        t.generator.Context.prototype.yield = function(d, n) {
            this.nextAddress = n;
            return {
                value: d
            }
        }
        ;
        t.generator.Context.prototype.yieldAll = function(d, n) {
            d = t.makeIterator(d);
            var x = d.next();
            t.generator.ensureIteratorResultIsObject_(x);
            if (x.done)
                this.yieldResult = x.value,
                    this.nextAddress = n;
            else
                return this.yieldAllIterator_ = d,
                    this.yield(x.value, n)
        }
        ;
        t.generator.Context.prototype.jumpTo = function(d) {
            this.nextAddress = d
        }
        ;
        t.generator.Context.prototype.jumpToEnd = function() {
            this.nextAddress = 0
        }
        ;
        t.generator.Context.prototype.setCatchFinallyBlocks = function(d, n) {
            this.catchAddress_ = d;
            void 0 != n && (this.finallyAddress_ = n)
        }
        ;
        t.generator.Context.prototype.setFinallyBlock = function(d) {
            this.catchAddress_ = 0;
            this.finallyAddress_ = d || 0
        }
        ;
        t.generator.Context.prototype.leaveTryBlock = function(d, n) {
            this.nextAddress = d;
            this.catchAddress_ = n || 0
        }
        ;
        t.generator.Context.prototype.enterCatchBlock = function(d) {
            this.catchAddress_ = d || 0;
            d = this.abruptCompletion_.exception;
            this.abruptCompletion_ = null;
            return d
        }
        ;
        t.generator.Context.prototype.enterFinallyBlock = function(d, n, x) {
            x ? this.finallyContexts_[x] = this.abruptCompletion_ : this.finallyContexts_ = [this.abruptCompletion_];
            this.catchAddress_ = d || 0;
            this.finallyAddress_ = n || 0
        }
        ;
        t.generator.Context.prototype.leaveFinallyBlock = function(d, n) {
            n = this.finallyContexts_.splice(n || 0)[0];
            if (n = this.abruptCompletion_ = this.abruptCompletion_ || n) {
                if (n.isException)
                    return this.jumpToErrorHandler_();
                void 0 != n.jumpTo && this.finallyAddress_ < n.jumpTo ? (this.nextAddress = n.jumpTo,
                    this.abruptCompletion_ = null) : this.nextAddress = this.finallyAddress_
            } else
                this.nextAddress = d
        }
        ;
        t.generator.Context.prototype.forIn = function(d) {
            return new t.generator.Context.PropertyIterator(d)
        }
        ;
        t.generator.Context.PropertyIterator = function(d) {
            this.object_ = d;
            this.properties_ = [];
            for (var n in d)
                this.properties_.push(n);
            this.properties_.reverse()
        }
        ;
        t.generator.Context.PropertyIterator.prototype.getNext = function() {
            for (; 0 < this.properties_.length; ) {
                var d = this.properties_.pop();
                if (d in this.object_)
                    return d
            }
            return null
        }
        ;
        t.generator.Engine_ = function(d) {
            this.context_ = new t.generator.Context;
            this.program_ = d
        }
        ;
        t.generator.Engine_.prototype.next_ = function(d) {
            this.context_.start_();
            if (this.context_.yieldAllIterator_)
                return this.yieldAllStep_(this.context_.yieldAllIterator_.next, d, this.context_.next_);
            this.context_.next_(d);
            return this.nextStep_()
        }
        ;
        t.generator.Engine_.prototype.return_ = function(d) {
            this.context_.start_();
            var n = this.context_.yieldAllIterator_;
            if (n)
                return this.yieldAllStep_("return"in n ? n["return"] : function(x) {
                        return {
                            value: x,
                            done: !0
                        }
                    }
                    , d, this.context_.return);
            this.context_.return(d);
            return this.nextStep_()
        }
        ;
        t.generator.Engine_.prototype.throw_ = function(d) {
            this.context_.start_();
            if (this.context_.yieldAllIterator_)
                return this.yieldAllStep_(this.context_.yieldAllIterator_["throw"], d, this.context_.next_);
            this.context_.throw_(d);
            return this.nextStep_()
        }
        ;
        t.generator.Engine_.prototype.yieldAllStep_ = function(d, n, x) {
            try {
                var q = d.call(this.context_.yieldAllIterator_, n);
                t.generator.ensureIteratorResultIsObject_(q);
                if (!q.done)
                    return this.context_.stop_(),
                        q;
                var p = q.value
            } catch (z) {
                return this.context_.yieldAllIterator_ = null,
                    this.context_.throw_(z),
                    this.nextStep_()
            }
            this.context_.yieldAllIterator_ = null;
            x.call(this.context_, p);
            return this.nextStep_()
        }
        ;
        t.generator.Engine_.prototype.nextStep_ = function() {
            for (; this.context_.nextAddress; )
                try {
                    var d = this.program_(this.context_);
                    if (d)
                        return this.context_.stop_(),
                            {
                                value: d.value,
                                done: !1
                            }
                } catch (n) {
                    this.context_.yieldResult = void 0,
                        this.context_.throw_(n)
                }
            this.context_.stop_();
            if (this.context_.abruptCompletion_) {
                d = this.context_.abruptCompletion_;
                this.context_.abruptCompletion_ = null;
                if (d.isException)
                    throw d.exception;
                return {
                    value: d.return,
                    done: !0
                }
            }
            return {
                value: void 0,
                done: !0
            }
        }
        ;
        t.generator.Generator_ = function(d) {
            this.next = function(n) {
                return d.next_(n)
            }
            ;
            this.throw = function(n) {
                return d.throw_(n)
            }
            ;
            this.return = function(n) {
                return d.return_(n)
            }
            ;
            this[Symbol.iterator] = function() {
                return this
            }
        }
        ;
        t.generator.createGenerator = function(d, n) {
            n = new t.generator.Generator_(new t.generator.Engine_(n));
            t.setPrototypeOf && d.prototype && t.setPrototypeOf(n, d.prototype);
            return n
        }
        ;
        t.asyncExecutePromiseGenerator = function(d) {
            function n(q) {
                return d.next(q)
            }
            function x(q) {
                return d.throw(q)
            }
            return new Promise(function(q, p) {
                    function z(E) {
                        E.done ? q(E.value) : Promise.resolve(E.value).then(n, x).then(z, p)
                    }
                    z(d.next())
                }
            )
        }
        ;
        t.asyncExecutePromiseGeneratorFunction = function(d) {
            return t.asyncExecutePromiseGenerator(d())
        }
        ;
        t.asyncExecutePromiseGeneratorProgram = function(d) {
            return t.asyncExecutePromiseGenerator(new t.generator.Generator_(new t.generator.Engine_(d)))
        }
        ;
        Bags = function() {
            function d() {
                this.x = this.y = this.h = this.v = this.xr = this.yr = this.dir = this.wt = this.gt = this.fallh = 0;
                this.wobbling = this.unfallen = this.exist = !1
            }
            function n(b) {
                var g;
                6 == f[b].dir && 1 < f[b].fallh ? f[b].gt = 1 : f[b].fallh = 0;
                f[b].dir = -1;
                f[b].wt = 15;
                f[b].wobbling = !1;
                var k = Drawing.drawgold(b, 0, f[b].x, f[b].y);
                Main.incpenalty();
                b = 1;
                for (g = 2; 8 > b; b++,
                    g <<= 1)
                    0 != (g & k) && z(b)
            }
            function x(b) {
                var g = Drawing.drawgold(b, 6, f[b].x, f[b].y);
                Main.incpenalty();
                0 != (g & 1) ? (Scores.scoregold(),
                    Sound.soundgold(),
                    Digger.digtime_w(0)) : Monster.mongold();
                z(b)
            }
            function q(b, g) {
                var k, A, I = !0;
                var v = k = f[b].x;
                var a = A = f[b].y;
                var m = f[b].h;
                var C = f[b].v;
                if (0 != f[b].gt)
                    return x(b),
                        !0;
                if (6 == f[b].dir && (4 == g || 0 == g))
                    return m = Drawing.drawgold(b, 3, k, A),
                        Main.incpenalty(),
                    0 != (m & 1) && Digger.diggery_r() >= A && Digger.killdigger(1, b),
                    0 != (m & 16128) && Monster.squashmonsters(b, m),
                        !0;
                if (292 == k && 0 == g || 12 == k && 4 == g || 180 == A && 6 == g || 18 == A && 2 == g)
                    I = !1;
                if (I) {
                    switch (g) {
                        case 0:
                            k += 4;
                            break;
                        case 4:
                            k -= 4;
                            break;
                        case 6:
                            f[b].unfallen ? (f[b].unfallen = !1,
                                Drawing.drawsquareblob(k, A),
                                Drawing.drawtopblob(k, A + 21)) : Drawing.drawfurryblob(k, A),
                                Drawing.eatfield(k, A, g),
                                Digger.killemerald(m, C),
                                A += 6
                    }
                    switch (g) {
                        case 6:
                            m = Drawing.drawgold(b, 3, k, A);
                            Main.incpenalty();
                            0 != (m & 1) && Digger.diggery_r() >= A && Digger.killdigger(1, b);
                            0 != (m & 16128) && Monster.squashmonsters(b, m);
                            break;
                        case 0:
                        case 4:
                            if (f[b].wt = 15,
                                f[b].wobbling = !1,
                                m = Drawing.drawgold(b, 0, k, A),
                                Main.incpenalty(),
                                F = 1,
                            0 == (m & 254) || p(g, m) || (k = v,
                                A = a,
                                Drawing.drawgold(b, 0, v, a),
                                Main.incpenalty(),
                                I = !1),
                            0 != (m & 1) || 0 != (m & 16128))
                                k = v,
                                    A = a,
                                    Drawing.drawgold(b, 0, v, a),
                                    Main.incpenalty(),
                                    I = !1
                    }
                    f[b].dir = I ? g : Digger.reversedir(g);
                    f[b].x = k;
                    f[b].y = A;
                    f[b].h = Math.floor((k - 12) / 20);
                    f[b].v = Math.floor((A - 18) / 18);
                    f[b].xr = (k - 12) % 20;
                    f[b].yr = (A - 18) % 18
                }
                return I
            }
            function p(b, g) {
                var k, A = !0;
                var I = 1;
                for (k = 2; 8 > I; I++,
                    k <<= 1)
                    0 != (g & k) && (q(I, b) || (A = !1));
                return A
            }
            function z(b) {
                f[b].exist && (f[b].exist = !1,
                    Sprite.erasespr(b))
            }
            function E(b) {
                var g = f[b].x;
                var k = f[b].h;
                var A = f[b].xr;
                var I = f[b].y;
                var v = f[b].v;
                var a = f[b].yr;
                switch (f[b].dir) {
                    case -1:
                        180 > I && 0 == A ? f[b].wobbling ? 0 == f[b].wt ? (f[b].dir = 6,
                            Sound.soundfall()) : (f[b].wt--,
                            k = f[b].wt % 8,
                        0 == (k & 1) && (Drawing.drawgold(b, w[k >> 1], g, I),
                            Main.incpenalty(),
                            Sound.soundwobble(f[b].wt))) : 4063 == (Monster.getfield(k, v + 1) & 4063) || Digger.checkdiggerunderbag(k, v + 1) || (f[b].wobbling = !0) : (f[b].wt = 15,
                            f[b].wobbling = !1);
                        break;
                    case 0:
                    case 4:
                        0 == A && (180 > I && 4063 != (Monster.getfield(k, v + 1) & 4063) ? (f[b].dir = 6,
                            f[b].wt = 0,
                            Sound.soundfall()) : n(b));
                        break;
                    case 6:
                        0 == a && f[b].fallh++,
                            180 <= I ? n(b) : 4063 == (Monster.getfield(k, v + 1) & 4063) && 0 == a && n(b),
                            Monster.checkmonscared(f[b].h)
                }
                -1 != f[b].dir && (6 != f[b].dir && 0 != F ? F-- : q(b, f[b].dir))
            }
            d.prototype.copyFrom = function(b) {
                this.x = b.x;
                this.y = b.y;
                this.h = b.h;
                this.v = b.v;
                this.xr = b.xr;
                this.yr = b.yr;
                this.dir = b.dir;
                this.wt = b.wt;
                this.gt = b.gt;
                this.fallh = b.fallh;
                this.wobbling = b.wobbling;
                this.unfallen = b.unfallen;
                this.exist = b.exist
            }
            ;
            var P = [new d, new d, new d, new d, new d, new d, new d, new d]
                , H = [new d, new d, new d, new d, new d, new d, new d, new d]
                , f = [new d, new d, new d, new d, new d, new d, new d, new d]
                , F = 0
                , c = 0
                , w = [2, 0, 1, 0];
            return {
                bagbits: function() {
                    var b, g = 0;
                    var k = 1;
                    for (b = 2; 8 > k; k++,
                        b <<= 1)
                        f[k].exist && (g |= b);
                    return g
                },
                baghitground: n,
                bagy: function(b) {
                    return f[b].y
                },
                cleanupbags: function() {
                    var b;
                    Sound.soundfalloff();
                    for (b = 1; 8 > b; b++)
                        f[b].exist && (7 == f[b].h && 9 == f[b].v || 0 != f[b].xr || 0 != f[b].yr || 0 != f[b].gt || 0 != f[b].fallh || f[b].wobbling) && (f[b].exist = !1,
                            Sprite.erasespr(b)),
                            0 == Main.getcplayer() ? P[b].copyFrom(f[b]) : H[b].copyFrom(f[b])
                },
                dobags: function() {
                    var b, g = !0, k = !0;
                    for (b = 1; 8 > b; b++)
                        f[b].exist && (0 != f[b].gt ? (1 == f[b].gt && (Sound.soundbreak(),
                            Drawing.drawgold(b, 4, f[b].x, f[b].y),
                            Main.incpenalty()),
                        3 == f[b].gt && (Drawing.drawgold(b, 5, f[b].x, f[b].y),
                            Main.incpenalty()),
                        5 == f[b].gt && (Drawing.drawgold(b, 6, f[b].x, f[b].y),
                            Main.incpenalty()),
                            f[b].gt++,
                            f[b].gt == c ? z(b) : 9 > f[b].v && f[b].gt < c - 10 && 0 == (Monster.getfield(f[b].h, f[b].v + 1) & 8192) && (f[b].gt = c - 10)) : E(b));
                    for (b = 1; 8 > b; b++)
                        6 == f[b].dir && f[b].exist && (g = !1),
                        6 != f[b].dir && f[b].wobbling && f[b].exist && (k = !1);
                    g && Sound.soundfalloff();
                    k && Sound.soundwobbleoff()
                },
                drawbags: function() {
                    return t.asyncExecutePromiseGeneratorFunction(function*() {
                        var b;
                        for (b = 1; 8 > b; b++)
                            0 == Main.getcplayer() ? f[b].copyFrom(P[b]) : f[b].copyFrom(H[b]),
                            f[b].exist && Sprite.movedrawspr(b, f[b].x, f[b].y),
                                Digger.newframe(),
                                yield ca(12)
                    })
                },
                getbagdir: function(b) {
                    return f[b].exist ? f[b].dir : -1
                },
                getgold: x,
                getnmovingbags: function() {
                    var b, g = 0;
                    for (b = 1; 8 > b; b++)
                        f[b].exist && 10 > f[b].gt && (0 != f[b].gt || f[b].wobbling) && g++;
                    return g
                },
                initbags: function() {
                    var b, g, k;
                    F = 0;
                    c = 150 - 10 * Main.levof10();
                    for (b = 1; 8 > b; b++)
                        f[b].exist = !1;
                    b = 1;
                    for (g = 0; 15 > g; g++)
                        for (k = 0; 10 > k; k++)
                            "B" == Main.getlevch(g, k, Main.levplan()) && 8 > b && (f[b].exist = !0,
                                f[b].gt = 0,
                                f[b].fallh = 0,
                                f[b].dir = -1,
                                f[b].wobbling = !1,
                                f[b].wt = 15,
                                f[b].unfallen = !0,
                                f[b].x = 20 * g + 12,
                                f[b].y = 18 * k + 18,
                                f[b].h = g,
                                f[b].v = k,
                                f[b].xr = 0,
                                f[b++].yr = 0);
                    if (0 == Main.getcplayer())
                        for (b = 1; 8 > b; b++)
                            P[b].copyFrom(f[b]);
                    else
                        for (b = 1; 8 > b; b++)
                            H[b].copyFrom(f[b])
                },
                pushbag: q,
                pushbags: p,
                pushudbags: function(b) {
                    var g, k = !0;
                    var A = 1;
                    for (g = 2; 8 > A; A++,
                        g <<= 1)
                        0 != (b & g) && (0 != f[A].gt ? x(A) : k = !1);
                    return k
                },
                removebag: z,
                removebags: function(b) {
                    var g;
                    var k = 1;
                    for (g = 2; 8 > k; k++,
                        g <<= 1)
                        f[k].exist && 0 != (b & g) && z(k)
                },
                updatebag: E
            }
        }();
        Digger = function() {
            function d() {
                switch (K) {
                    case 1:
                        Bags.bagy(D) + 6 > y && (y = Bags.bagy(D) + 6);
                        Drawing.drawdigger(15, u, y, !1);
                        Main.incpenalty();
                        0 == Bags.getbagdir(D) + 1 && (Sound.soundddie(),
                            ja = 5,
                            K = 2,
                            L = 0,
                            y -= 6);
                        break;
                    case 2:
                        if (0 != ja) {
                            ja--;
                            break
                        }
                        0 == L && Sound.music(2);
                        var B = Drawing.drawdigger(14 - L, u, y, !1);
                        Main.incpenalty();
                        0 == L && 0 != (B & 16128) && Monster.killmonsters(B);
                        4 > L ? (L++,
                            ja = 2) : (K = 4,
                            ja = Sound.getmusicflag() ? 60 : 10);
                        break;
                    case 3:
                        K = 5;
                        ja = L = 0;
                        break;
                    case 5:
                        0 <= L && 6 >= L && (Drawing.drawdigger(15, u, y - Aa[L], !1),
                        6 == L && Sound.musicoff(),
                            Main.incpenalty(),
                            L++,
                        1 == L && Sound.soundddie(),
                        7 == L && (ja = 5,
                            L = 0,
                            K = 2));
                        break;
                    case 4:
                        0 != ja ? ja-- : Main.setdead(!0)
                }
            }
            function n() {
                switch (l) {
                    case 1:
                        Sound.soundexplode();
                    case 2:
                    case 3:
                        Drawing.drawfire(O, J, l);
                        Main.incpenalty();
                        l++;
                        break;
                    default:
                        H(),
                            l = 0
                }
            }
            function x() {
                ka = !1;
                Pc.ginten(0)
            }
            function q() {
                ua && (ua = !1,
                    Sprite.erasespr(14));
                Pc.ginten(0)
            }
            function p(B, G, S, W, aa) {
                var la = !1;
                if (0 > aa || 6 < aa || 0 != (aa & 1))
                    return la;
                0 == aa && 0 != S && B++;
                6 == aa && 0 != W && G++;
                S = 0 == aa || 4 == aa ? S : W;
                0 != (ba[15 * G + B] & fa) && (S == Ba[aa] && (Drawing.drawemerald(20 * B + 12, 18 * G + 21),
                    Main.incpenalty()),
                S == Ba[aa + 1] && (Drawing.eraseemerald(20 * B + 12, 18 * G + 21),
                    Main.incpenalty(),
                    la = !0,
                    ba[15 * G + B] &= ~fa));
                return la
            }
            function z() {
                ka = !0;
                q();
                Pc.ginten(1);
                va = 250 - 20 * Main.levof10();
                na = 20;
                wa = 1
            }
            function E(B) {
                B = B || window.event;
                switch (B.keyCode) {
                    case 37:
                        Input.processkey(203);
                        break;
                    case 39:
                        Input.processkey(205);
                        break;
                    case 38:
                        Input.processkey(200);
                        break;
                    case 40:
                        Input.processkey(208);
                        break;
                    case 32:
                        Input.processkey(187);
                        break;
                    default:
                        return
                }
                B.preventDefault && B.preventDefault()
            }
            function P(B) {
                B = B || window.event;
                switch (B.keyCode) {
                    case 37:
                    case 38:
                    case 39:
                    case 40:
                    case 32:
                        break;
                    default:
                        return
                }
                B.preventDefault && B.preventDefault()
            }
            function H() {
                ha || (ha = !0,
                    Sprite.erasespr(15),
                    Sound.soundfireoff())
            }
            function f() {
                Input.checkkeyb();
                A.putImageData(I, 0, 0);
                b.drawImage(k, 0, 0, g.width, g.height)
            }
            function F(B) {
                switch (B) {
                    case 0:
                        return 4;
                    case 4:
                        return 0;
                    case 2:
                        return 6;
                    case 6:
                        return 2
                }
                return B
            }
            function c() {
                var B = !1;
                Input.readdir();
                var G = Input.getdir();
                var S = 0 == G || 2 == G || 4 == G || 6 == G ? G : -1;
                0 != e || 2 != S && 6 != S || (R = Q = S);
                0 != r || 4 != S && 0 != S || (R = Q = S);
                Q = -1 == G ? -1 : R;
                if (292 == u && 0 == Q || 12 == u && 4 == Q || 180 == y && 6 == Q || 18 == y && 2 == Q)
                    Q = -1;
                S = u;
                var W = y;
                -1 != Q && Drawing.eatfield(S, W, Q);
                switch (Q) {
                    case 0:
                        Drawing.drawrightblob(u, y);
                        u += 4;
                        break;
                    case 4:
                        Drawing.drawleftblob(u, y);
                        u -= 4;
                        break;
                    case 2:
                        Drawing.drawtopblob(u, y);
                        y -= 3;
                        break;
                    case 6:
                        Drawing.drawbottomblob(u, y),
                            y += 3
                }
                p(Math.floor((u - 12) / 20), Math.floor((y - 18) / 18), (u - 12) % 20, (y - 18) % 18, Q) && (0 == oa && (da = 0),
                    Scores.scoreemerald(),
                    Sound.soundem(),
                    Sound.soundemerald(da),
                    da++,
                8 == da && (da = 0,
                    Scores.scoreoctave()),
                    oa = 9);
                G = Drawing.drawdigger(R, u, y, ha && 0 == U);
                Main.incpenalty();
                0 != (Bags.bagbits() & G) && (0 == Q || 4 == Q ? (B = Bags.pushbags(Q, G),
                    V++) : Bags.pushudbags(G) || (B = !1),
                B || (u = S,
                    y = W,
                    Drawing.drawdigger(Q, u, y, ha && 0 == U),
                    Main.incpenalty(),
                    R = F(Q)));
                if (0 != (G & 16128) && ka)
                    for (B = Monster.killmonsters(G); 0 != B; B--)
                        Sound.soundeatm(),
                            Scores.scoreeatm();
                0 != (G & 16384) && (Scores.scorebonus(),
                    z());
                N = Math.floor((u - 12) / 20);
                e = (u - 12) % 20;
                M = Math.floor((y - 18) / 18);
                r = (y - 18) % 18
            }
            function w() {
                var B, G = 0;
                if (ha)
                    if (0 != U)
                        U--;
                    else {
                        if (Input.getfirepflag() && ia) {
                            U = 3 * Main.levof10() + 60;
                            ha = !1;
                            switch (R) {
                                case 0:
                                    O = u + 8;
                                    J = y + 4;
                                    break;
                                case 4:
                                    O = u;
                                    J = y + 4;
                                    break;
                                case 2:
                                    O = u + 4;
                                    J = y;
                                    break;
                                case 6:
                                    O = u + 4,
                                        J = y + 8
                            }
                            h = R;
                            Sprite.movedrawspr(15, O, J);
                            Sound.soundfire()
                        }
                    }
                else {
                    switch (h) {
                        case 0:
                            O += 8;
                            G = Pc.ggetpix(O, J + 4) | Pc.ggetpix(O + 4, J + 4);
                            break;
                        case 4:
                            O -= 8;
                            G = Pc.ggetpix(O, J + 4) | Pc.ggetpix(O + 4, J + 4);
                            break;
                        case 2:
                            J -= 7;
                            G = (Pc.ggetpix(O + 4, J) | Pc.ggetpix(O + 4, J + 1) | Pc.ggetpix(O + 4, J + 2) | Pc.ggetpix(O + 4, J + 3) | Pc.ggetpix(O + 4, J + 4) | Pc.ggetpix(O + 4, J + 5) | Pc.ggetpix(O + 4, J + 6)) & 192;
                            break;
                        case 6:
                            J += 7,
                                G = (Pc.ggetpix(O, J) | Pc.ggetpix(O, J + 1) | Pc.ggetpix(O, J + 2) | Pc.ggetpix(O, J + 3) | Pc.ggetpix(O, J + 4) | Pc.ggetpix(O, J + 5) | Pc.ggetpix(O, J + 6)) & 3
                    }
                    var S = Drawing.drawfire(O, J, 0);
                    Main.incpenalty();
                    if (0 != (S & 16128)) {
                        var W = 0;
                        for (B = 256; 6 > W; W++,
                            B <<= 1)
                            0 != (S & B) && (Monster.killmon(W),
                                Scores.scorekill(),
                                l = 1)
                    }
                    0 != (S & 16638) && (l = 1);
                    switch (h) {
                        case 0:
                            296 < O ? l = 1 : 0 != G && 0 == S && (l = 1,
                                O -= 8,
                                Drawing.drawfire(O, J, 0));
                            break;
                        case 4:
                            16 > O ? l = 1 : 0 != G && 0 == S && (l = 1,
                                O += 8,
                                Drawing.drawfire(O, J, 0));
                            break;
                        case 2:
                            15 > J ? l = 1 : 0 != G && 0 == S && (l = 1,
                                J += 7,
                                Drawing.drawfire(O, J, 0));
                            break;
                        case 6:
                            183 < J ? l = 1 : 0 != G && 0 == S && (l = 1,
                                J -= 7,
                                Drawing.drawfire(O, J, 0))
                    }
                }
            }
            var b, g, k, A, I, v, a, m = 0, C = 0, u = 0, y = 0, N = 0, M = 0, e = 0, r = 0, Q = 0, R = 0, V = 0, U = 0, O = 0, J = 0, h = 0, l = 0, K = 0, D = 0, L = 0, ja = 0, na = 0, va = 0, wa = 0, oa = 0, da = 0, fa = 0, ba = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ia = !1, ha = !1, ua = !1, ka = !1, qa = !1, Ba = [8, 12, 12, 9, 16, 12, 6, 9], Aa = [3, 5, 6, 6, 5, 3, 0];
            return {
                checkdiggerunderbag: function(B, G) {
                    return 2 != Q && 6 != Q || Math.floor((u - 12) / 20) != B || Math.floor((y - 18) / 18) != G && Math.floor((y - 18) / 18) + 1 != G ? !1 : !0
                },
                countem: function() {
                    var B, G, S = 0;
                    for (B = 0; 15 > B; B++)
                        for (G = 0; 10 > G; G++)
                            0 != (ba[15 * G + B] & fa) && S++;
                    return S
                },
                createbonus: function() {
                    ua = !0;
                    Drawing.drawbonus(292, 18)
                },
                diggerdie: d,
                dodigger: function() {
                    f();
                    0 != l ? n() : w();
                    qa && (ia ? 0 != V ? (Drawing.drawdigger(Q, u, y, ha && 0 == U),
                        Main.incpenalty(),
                        V--) : c() : d());
                    if (ka && ia)
                        if (0 != va) {
                            if (va--,
                            0 != na || 20 > va)
                                na && na--,
                                    0 != (va & 1) ? Pc.ginten(0) : Pc.ginten(1),
                                    Sound.soundbonus(),
                                0 == na && (Sound.music(0),
                                    Sound.soundbonusoff(),
                                    Pc.ginten(1))
                        } else
                            x(),
                                Sound.soundbonusoff(),
                                Sound.music(1);
                    ka && !ia && (x(),
                        Sound.soundbonusoff(),
                        Sound.music(1));
                    0 < oa && oa--
                },
                drawemeralds: function() {
                    return t.asyncExecutePromiseGeneratorFunction(function*() {
                        var B, G;
                        fa = 1 << Main.getcplayer();
                        for (B = 0; 15 > B; B++) {
                            for (G = 0; 10 > G; G++)
                                0 != (ba[15 * G + B] & fa) && Drawing.drawemerald(20 * B + 12, 18 * G + 21);
                            f();
                            yield ca(12)
                        }
                    })
                },
                drawexplosion: n,
                endbonusmode: x,
                erasebonus: q,
                erasedigger: function() {
                    Sprite.erasespr(0);
                    qa = !1
                },
                hitemerald: p,
                init: function() {
                    function B(Y, X, Z) {
                        var pa = null;
                        Y.ontouchstart = function(Ha) {
                            if (Ha.targetTouches.length) {
                                Z && (ma = Z);
                                if (!X) {
                                    if (!ma)
                                        return;
                                    pa = ma
                                }
                                Input.processkey(pa ? pa[0] : X[0])
                            }
                        }
                        ;
                        Y.ontouchend = function() {
                            Input.processkey(pa ? pa[1] : X[1])
                        }
                    }
                    document.onkeydown = function(Y) {
                        "function" == typeof fuinput && fuinput();
                        a: {
                            Y = Y || window.event;
                            switch (Y.keyCode) {
                                case 37:
                                    Input.processkey(75);
                                    break;
                                case 39:
                                    Input.processkey(77);
                                    break;
                                case 38:
                                    Input.processkey(72);
                                    break;
                                case 40:
                                    Input.processkey(80);
                                    break;
                                case 32:
                                    Input.processkey(59);
                                    break;
                                default:
                                    break a
                            }
                            Y.preventDefault && Y.preventDefault()
                        }
                    }
                    ;
                    document.onkeyup = E;
                    document.onkeypress = P;
                    document.ontouchmove = function(Y) {
                        Y.preventDefault()
                    }
                    ;
                    var G = {
                        af: [59, 187],
                        ag: [59, 187],
                        al: [75, 203],
                        ar: [77, 205],
                        au: [72, 200],
                        ad: [80, 208],
                        arev1: null,
                        arev2: null
                    }, S = {
                        al: "ar",
                        ar: "al",
                        au: "ad",
                        ad: "au"
                    }, W;
                    for (W in G) {
                        var aa = document.getElementById(W);
                        if (aa) {
                            var la = S[W];
                            B(aa, G[W], la ? G[la] : null)
                        }
                    }
                    var ma = null;
                    Date.now || (Date.now = function() {
                            return +new Date
                        }
                    );
                    if (a = document.getElementById("dcont")) {
                        g = document.createElement("canvas");
                        a.appendChild(g);
                        b = g.getContext("2d");
                        window.digsnd = function(Y) {
                            Sound.setaudio(!!Y)
                        }
                        ;
                        window.digadj = function() {
                            if (a && g) {
                                var Y = window.devicePixelRatio || 1
                                    , X = a.offsetWidth
                                    , Z = a.offsetHeight;
                                320 < X && (X = 160 * Math.floor(X / 160));
                                320 == Z && (Z = 300);
                                Z > 200 * X / 320 && (Z = Math.round(200 * X / 320));
                                X > 320 * Z / 200 && (X = Math.round(320 * Z / 200));
                                g.style.marginTop = (a.offsetHeight - Z >> 1) + "px";
                                if (m != X || C != Z)
                                    m = X,
                                        C = Z,
                                        g.width = Math.round(X * Y),
                                        g.height = Math.round(Z * Y),
                                        g.style.width = X + "px",
                                        g.style.height = Z + "px",
                                        b.imageSmoothingEnabled = !1
                            }
                        }
                        ;
                        window.digadj();
                        k = document.createElement("canvas");
                        k.width = 320;
                        k.height = 200;
                        A = k.getContext("2d");
                        I = A.getImageData(0, 0, 320, 200);
                        v = I.data;
                        for (W = 3; W < v.length; W += 4)
                            v[W] = 255;
                        Main.main()
                    }
                },
                initbonusmode: z,
                initdigger: function() {
                    M = 9;
                    Q = 4;
                    N = 7;
                    u = 20 * N + 12;
                    V = r = e = R = 0;
                    ia = !0;
                    K = 1;
                    qa = !0;
                    y = 18 * M + 18;
                    Sprite.movedrawspr(0, u, y);
                    ha = !0;
                    da = oa = 0;
                    ua = ka = !1;
                    Input.firepressed_w(!1);
                    U = l = 0
                },
                killdigger: function(B, G) {
                    if (2 > K || 4 < K)
                        ia = !1,
                            K = B,
                            D = G
                },
                killemerald: function(B, G) {
                    0 != (ba[15 * G + B + 15] & fa) && (ba[15 * G + B + 15] &= ~fa,
                        Drawing.eraseemerald(20 * B + 12, 18 * (G + 1) + 21))
                },
                killfire: H,
                makeemfield: function() {
                    var B, G;
                    fa = 1 << Main.getcplayer();
                    for (B = 0; 15 > B; B++)
                        for (G = 0; 10 > G; G++)
                            "C" == Main.getlevch(B, G, Main.levplan()) ? ba[15 * G + B] |= fa : ba[15 * G + B] &= ~fa
                },
                newframe: f,
                reversedir: F,
                updatedigger: c,
                updatefire: w,
                bonusmode_r: function() {
                    return ka
                },
                bonusvisible_w: function(B) {
                    ua = B
                },
                diggerx_r: function() {
                    return u
                },
                diggery_r: function() {
                    return y
                },
                digonscr_r: function() {
                    return ia
                },
                digtime_w: function(B) {
                    V = B
                },
                eatmsc_r: function() {
                    return wa
                },
                eatmsc_w: function(B) {
                    wa = B
                },
                time_w: function() {},
                getgpix: function() {
                    return v
                }
            }
        }();
        window.digstart = function() {
            Digger.init()
        }
        ;
        Drawing = function() {
            function d() {
                O = 1;
                J = U = 0;
                Sprite.createspr(0, 0, w, 4, 15, 0, 0);
                Sprite.createspr(14, 81, e, 4, 15, 0, 0);
                Sprite.createspr(15, 82, r, 2, 8, 0, 0)
            }
            function n(h) {
                return t.asyncExecutePromiseGeneratorFunction(function*() {
                    var l, K;
                    for (K = 14; 200 > K; K += 4) {
                        for (l = 0; 320 > l; l += 20)
                            Sprite.drawmiscspr(l, K, 93 + h, 5, 4);
                        Digger.newframe();
                        yield ca(12)
                    }
                })
            }
            function x(h, l) {
                Sprite.initmiscspr(h - 4, l + 15, 6, 6);
                Sprite.drawmiscspr(h - 4, l + 15, 105, 6, 6);
                Sprite.getis()
            }
            function q() {
                return t.asyncExecutePromiseGeneratorFunction(function*() {
                    var h, l;
                    for (h = 0; 15 > h; h++)
                        for (l = 0; 10 > l; l++)
                            if (0 == (c[15 * l + h] & 8192)) {
                                var K = 20 * h + 12;
                                var D = 18 * l + 18;
                                4032 != (c[15 * l + h] & 4032) && (c[15 * l + h] &= 53311,
                                    x(K, D - 15),
                                    x(K, D - 12),
                                    x(K, D - 9),
                                    x(K, D - 6),
                                    x(K, D - 3),
                                    P(K, D + 3));
                                31 != (c[15 * l + h] & 31) && (c[15 * l + h] &= 57312,
                                    E(K - 16, D),
                                    E(K - 12, D),
                                    E(K - 8, D),
                                    E(K - 4, D),
                                    p(K + 4, D));
                                14 > h && 4063 != (c[15 * l + h + 1] & 4063) && E(K, D);
                                9 > l && 4063 != (c[15 * (l + 1) + h] & 4063) && x(K, D);
                                Digger.newframe();
                                yield ca(18)
                            }
                })
            }
            function p(h, l) {
                Sprite.initmiscspr(h - 8, l - 1, 2, 18);
                Sprite.drawmiscspr(h - 8, l - 1, 104, 2, 18);
                Sprite.getis()
            }
            function z(h, l, K) {
                Sprite.drawmiscspr(l, K, h + 110, 4, 12)
            }
            function E(h, l) {
                Sprite.initmiscspr(h + 16, l - 1, 2, 18);
                Sprite.drawmiscspr(h + 16, l - 1, 102, 2, 18);
                Sprite.getis()
            }
            function P(h, l) {
                Sprite.initmiscspr(h - 4, l - 6, 6, 6);
                Sprite.drawmiscspr(h - 4, l - 6, 103, 6, 6);
                Sprite.getis()
            }
            function H() {
                O = 1;
                J = U = 0;
                Sprite.initspr(0, 0, 4, 15, 0, 0);
                Sprite.initspr(14, 81, 4, 15, 0, 0);
                Sprite.initspr(15, 82, 2, 8, 0, 0)
            }
            var f = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , F = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , c = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , w = Array(480)
                , b = Array(480)
                , g = Array(480)
                , k = Array(480)
                , A = Array(480)
                , I = Array(480)
                , v = Array(480)
                , a = Array(480)
                , m = Array(480)
                , C = Array(480)
                , u = Array(480)
                , y = Array(480)
                , N = Array(480)
                , M = Array(480)
                , e = Array(480)
                , r = Array(128)
                , Q = [65534, 65533, 65531, 65527, 65519, 65503, 65471, 65407, 65279, 65023, 64511, 63487]
                , R = [0, 0, 0, 0, 0, 0]
                , V = [0, 0, 0, 0, 0, 0]
                , U = 0
                , O = 0
                , J = 0;
            return {
                createdbfspr: d,
                creatembspr: function() {
                    var h;
                    Sprite.createspr(1, 62, b, 4, 15, 0, 0);
                    Sprite.createspr(2, 62, g, 4, 15, 0, 0);
                    Sprite.createspr(3, 62, k, 4, 15, 0, 0);
                    Sprite.createspr(4, 62, A, 4, 15, 0, 0);
                    Sprite.createspr(5, 62, I, 4, 15, 0, 0);
                    Sprite.createspr(6, 62, v, 4, 15, 0, 0);
                    Sprite.createspr(7, 62, a, 4, 15, 0, 0);
                    Sprite.createspr(8, 71, m, 4, 15, 0, 0);
                    Sprite.createspr(9, 71, C, 4, 15, 0, 0);
                    Sprite.createspr(10, 71, u, 4, 15, 0, 0);
                    Sprite.createspr(11, 71, y, 4, 15, 0, 0);
                    Sprite.createspr(12, 71, N, 4, 15, 0, 0);
                    Sprite.createspr(13, 71, M, 4, 15, 0, 0);
                    d();
                    for (h = 0; 6 > h; h++)
                        R[h] = 0,
                            V[h] = 1
                },
                drawbackg: n,
                drawbonus: function(h, l) {
                    Sprite.initspr(14, 81, 4, 15, 0, 0);
                    Sprite.movedrawspr(14, h, l)
                },
                drawbottomblob: x,
                drawdigger: function(h, l, K, D) {
                    U += O;
                    if (2 == U || 0 == U)
                        O = -O;
                    2 < U && (U = 2);
                    0 > U && (U = 0);
                    return 0 <= h && 6 >= h && 0 == (h & 1) ? (Sprite.initspr(0, 3 * (h + (D ? 0 : 1)) + U + 1, 4, 15, 0, 0),
                        Sprite.drawspr(0, l, K)) : 10 <= h && 15 >= h ? (Sprite.initspr(0, 40 - h, 4, 15, 0, 0),
                        Sprite.drawspr(0, l, K)) : 0
                },
                drawemerald: function(h, l) {
                    Sprite.initmiscspr(h, l, 4, 10);
                    Sprite.drawmiscspr(h, l, 108, 4, 10);
                    Sprite.getis()
                },
                drawfield: q,
                drawfire: function(h, l, K) {
                    0 == K ? (J++,
                    2 < J && (J = 0),
                        Sprite.initspr(15, 82 + J, 2, 8, 0, 0)) : Sprite.initspr(15, 84 + K, 2, 8, 0, 0);
                    return Sprite.drawspr(15, h, l)
                },
                drawfurryblob: function(h, l) {
                    Sprite.initmiscspr(h - 4, l + 15, 6, 8);
                    Sprite.drawmiscspr(h - 4, l + 15, 107, 6, 8);
                    Sprite.getis()
                },
                drawgold: function(h, l, K, D) {
                    Sprite.initspr(h, l + 62, 4, 15, 0, 0);
                    return Sprite.drawspr(h, K, D)
                },
                drawleftblob: p,
                drawlife: z,
                drawlives: function() {
                    var h;
                    var l = Main.getlives(1) - 1;
                    for (h = 1; 5 > h; h++)
                        z(0 < l ? 0 : 2, 20 * h + 60, 0),
                            l--;
                    if (2 == Main.getnplayers())
                        for (l = Main.getlives(2) - 1,
                                 h = 1; 5 > h; h++)
                            z(0 < l ? 1 : 2, 244 - 20 * h, 0),
                                l--
                },
                drawmon: function(h, l, K, D, L) {
                    R[h] += V[h];
                    if (2 == R[h] || 0 == R[h])
                        V[h] = -V[h];
                    2 < R[h] && (R[h] = 2);
                    0 > R[h] && (R[h] = 0);
                    if (l)
                        Sprite.initspr(h + 8, R[h] + 69, 4, 15, 0, 0);
                    else
                        switch (K) {
                            case 0:
                                Sprite.initspr(h + 8, R[h] + 73, 4, 15, 0, 0);
                                break;
                            case 4:
                                Sprite.initspr(h + 8, R[h] + 77, 4, 15, 0, 0)
                        }
                    return Sprite.drawspr(h + 8, D, L)
                },
                drawmondie: function(h, l, K, D, L) {
                    if (l)
                        Sprite.initspr(h + 8, 72, 4, 15, 0, 0);
                    else
                        switch (K) {
                            case 0:
                                Sprite.initspr(h + 8, 76, 4, 15, 0, 0);
                                break;
                            case 4:
                                Sprite.initspr(h + 8, 80, 4, 14, 0, 0)
                        }
                    return Sprite.drawspr(h + 8, D, L)
                },
                drawrightblob: E,
                drawsquareblob: function(h, l) {
                    Sprite.initmiscspr(h - 4, l + 17, 6, 6);
                    Sprite.drawmiscspr(h - 4, l + 17, 106, 6, 6);
                    Sprite.getis()
                },
                drawstatics: function() {
                    return t.asyncExecutePromiseGeneratorFunction(function*() {
                        var h, l;
                        for (h = 0; 15 > h; h++)
                            for (l = 0; 10 > l; l++)
                                0 == Main.getcplayer() ? c[15 * l + h] = f[15 * l + h] : c[15 * l + h] = F[15 * l + h];
                        Sprite.setretr(!0);
                        Pc.gpal(0);
                        Pc.ginten(0);
                        yield n(Main.levplan());
                        yield q()
                    })
                },
                drawtopblob: P,
                eatfield: function(h, l, K) {
                    var D = Math.floor((h - 12) / 20);
                    h = Math.floor((h - 12) % 20 / 4);
                    var L = Math.floor((l - 18) / 18);
                    l = Math.floor((l - 18) % 18 / 3);
                    Main.incpenalty();
                    switch (K) {
                        case 0:
                            D++;
                            c[15 * L + D] &= Q[h];
                            if (0 != (c[15 * L + D] & 31))
                                break;
                            c[15 * L + D] &= 57343;
                            break;
                        case 4:
                            h--;
                            0 > h && (h += 5,
                                D--);
                            c[15 * L + D] &= Q[h];
                            if (0 != (c[15 * L + D] & 31))
                                break;
                            c[15 * L + D] &= 57343;
                            break;
                        case 2:
                            l--;
                            0 > l && (l += 6,
                                L--);
                            c[15 * L + D] &= Q[6 + l];
                            if (0 != (c[15 * L + D] & 4032))
                                break;
                            c[15 * L + D] &= 57343;
                            break;
                        case 6:
                            L++,
                                c[15 * L + D] &= Q[6 + l],
                            0 == (c[15 * L + D] & 4032) && (c[15 * L + D] &= 57343)
                    }
                },
                eraseemerald: function(h, l) {
                    Sprite.initmiscspr(h, l, 4, 10);
                    Sprite.drawmiscspr(h, l, 109, 4, 10);
                    Sprite.getis()
                },
                initdbfspr: H,
                initmbspr: function() {
                    Sprite.initspr(1, 62, 4, 15, 0, 0);
                    Sprite.initspr(2, 62, 4, 15, 0, 0);
                    Sprite.initspr(3, 62, 4, 15, 0, 0);
                    Sprite.initspr(4, 62, 4, 15, 0, 0);
                    Sprite.initspr(5, 62, 4, 15, 0, 0);
                    Sprite.initspr(6, 62, 4, 15, 0, 0);
                    Sprite.initspr(7, 62, 4, 15, 0, 0);
                    Sprite.initspr(8, 71, 4, 15, 0, 0);
                    Sprite.initspr(9, 71, 4, 15, 0, 0);
                    Sprite.initspr(10, 71, 4, 15, 0, 0);
                    Sprite.initspr(11, 71, 4, 15, 0, 0);
                    Sprite.initspr(12, 71, 4, 15, 0, 0);
                    Sprite.initspr(13, 71, 4, 15, 0, 0);
                    H()
                },
                makefield: function() {
                    var h, l;
                    for (h = 0; 15 > h; h++)
                        for (l = 0; 10 > l; l++) {
                            c[15 * l + h] = -1;
                            var K = Main.getlevch(h, l, Main.levplan());
                            if ("S" == K || "V" == K)
                                c[15 * l + h] &= 53311;
                            if ("S" == K || "H" == K)
                                c[15 * l + h] &= 57312;
                            0 == Main.getcplayer() ? f[15 * l + h] = c[15 * l + h] : F[15 * l + h] = c[15 * l + h]
                        }
                },
                outtext: function(h, l, K, D) {
                    var L;
                    for (L = 0; L < h.length; L++)
                        Pc.gwrite(l, K, h.charAt(L), D),
                            l += 12
                },
                savefield: function() {
                    var h, l;
                    for (h = 0; 15 > h; h++)
                        for (l = 0; 10 > l; l++)
                            0 == Main.getcplayer() ? f[15 * l + h] = c[15 * l + h] : F[15 * l + h] = c[15 * l + h]
                },
                field: c
            }
        }();
        Input = function() {
            function d() {
                b = !0;
                m = C = 6
            }
            function n() {
                b = !1;
                6 == m && f()
            }
            function x() {
                g = k = !0
            }
            function q() {
                F = !0;
                m = C = 4
            }
            function p() {
                F = !1;
                4 == m && f()
            }
            function z() {
                c = !0;
                m = C = 0
            }
            function E() {
                c = !1;
                0 == m && f()
            }
            function P() {
                w = !0;
                m = C = 2
            }
            function H() {
                w = !1;
                2 == m && f()
            }
            function f() {
                m = -1;
                w && (m = C = 2);
                b && (m = C = 6);
                F && (m = C = 4);
                c && (m = C = 0)
            }
            var F = !1, c = !1, w = !1, b = !1, g = !1, k = !1, A, I = !1, v = 0, a, m = -1, C = -1, u = 0, y = !1;
            return {
                checkkeyb: function() {
                    A && (I = !0)
                },
                detectjoy: function() {
                    C = m = -1
                },
                getasciikey: function(N) {
                    return " " == N || "a" <= N && "z" >= N || "0" <= N && "9" >= N ? N : 0
                },
                getdir: function() {
                    return u
                },
                initkeyb: function() {},
                Key_downpressed: d,
                Key_downreleased: n,
                Key_f1pressed: x,
                Key_f1released: function() {
                    g = !1
                },
                Key_leftpressed: q,
                Key_leftreleased: p,
                Key_rightpressed: z,
                Key_rightreleased: E,
                Key_uppressed: P,
                Key_upreleased: H,
                processkey: function(N) {
                    v = N;
                    128 < N && (a = N & 127);
                    switch (N) {
                        case 75:
                            q();
                            break;
                        case 203:
                            p();
                            break;
                        case 77:
                            z();
                            break;
                        case 205:
                            E();
                            break;
                        case 72:
                            P();
                            break;
                        case 200:
                            H();
                            break;
                        case 80:
                            d();
                            break;
                        case 208:
                            n();
                            break;
                        case 59:
                            x();
                            break;
                        case 187:
                            g = !1;
                            break;
                        case 120:
                            A = !0;
                            break;
                        case 248:
                            A = !1
                    }
                },
                readdir: function() {
                    u = C;
                    -1 != m && (u = m);
                    C = -1;
                    y = g || k ? !0 : !1;
                    k = !1
                },
                readjoy: function() {},
                setdirec: f,
                teststart: function() {
                    var N = !1;
                    0 != v && 0 == (v & 128) && 27 != v && (N = !0,
                        v = 0);
                    return N ? !0 : !1
                },
                getfirepflag: function() {
                    return y
                },
                firepressed_w: function(N) {
                    k = N
                },
                keypressed_r: function() {
                    return v
                },
                keypressed_w: function(N) {
                    v = N
                },
                akeypressed_r: function() {
                    return a
                },
                akeypressed_w: function(N) {
                    a = N
                },
                escape_r: function() {
                    return I
                }
            }
        }();
        function ca(d) {
            return new Promise(n=>setTimeout(n, d))
        }
        Main = function() {
            function d() {
                this.lives = this.level = 0;
                this.dead = this.levdone = !1
            }
            function n() {
                0 != Digger.countem() && 0 != Monster.monleft() || !Digger.digonscr_r() ? w[g].levdone = !1 : w[g].levdone = !0
            }
            function x() {
                Drawing.outtext("                          ", 0, 0, 3);
                Drawing.outtext(" ", 308, 0, 3)
            }
            function q() {
                return t.asyncExecutePromiseGeneratorFunction(function*() {
                    Drawing.creatembspr();
                    yield Drawing.drawstatics();
                    yield Bags.drawbags();
                    yield Digger.drawemeralds();
                    Digger.initdigger();
                    Monster.initmonsters()
                })
            }
            function p() {
                Drawing.initmbspr();
                Digger.initdigger();
                Monster.initmonsters()
            }
            function z() {
                w[g].levdone = !1;
                Drawing.makefield();
                Digger.makeemfield();
                Bags.initbags();
                I = !0
            }
            function E() {
                return w[g].level
            }
            function P() {
                return t.asyncExecutePromiseGeneratorFunction(function*() {
                    var u, y;
                    if (I) {
                        if (I = !1,
                            yield q(),
                            Digger.time_w(Pc.gethrt()),
                            v) {
                            v = !1;
                            b = "PLAYER ";
                            b = 0 == g ? b + "1" : b + "2";
                            x();
                            for (u = 0; 15 > u; u++)
                                for (y = 1; 3 >= y; y++)
                                    if (Drawing.outtext(b, 108, 0, y),
                                        Scores.writecurscore(y),
                                        Digger.newframe(),
                                        Input.escape_r())
                                        return;
                            Scores.drawscores();
                            Scores.addscore(0)
                        }
                    } else
                        p();
                    Input.keypressed_w(0);
                    Drawing.outtext("        ", 108, 0, 3);
                    Scores.initscores();
                    Drawing.drawlives();
                    Sound.music(1);
                    Input.readdir();
                    Digger.time_w(Pc.gethrt());
                    yield new Promise(N=>{
                            var M = setInterval(function() {
                                w[g].dead || w[g].levdone || Input.escape_r() ? (clearInterval(M),
                                    N()) : (A = 0,
                                    Digger.dodigger(),
                                    Monster.domonsters(),
                                    Bags.dobags(),
                                8 < A && Monster.incmont(A - 8),
                                    F(),
                                    n())
                            }, C)
                        }
                    );
                    Digger.erasedigger();
                    Sound.musicoff();
                    u = 20;
                    yield new Promise(N=>{
                            var M = setInterval(function() {
                                0 == Bags.getnmovingbags() && 0 == u || Input.escape_r() ? (clearInterval(M),
                                    N()) : (0 != u && u--,
                                    A = 0,
                                    Bags.dobags(),
                                    Digger.dodigger(),
                                    Monster.domonsters(),
                                8 > A && (u = 0))
                            }, C)
                        }
                    );
                    Sound.soundstop();
                    Digger.killfire();
                    Digger.erasebonus();
                    Bags.cleanupbags();
                    Drawing.savefield();
                    Monster.erasemonsters();
                    Digger.newframe();
                    w[g].levdone && (yield ca(12 * C));
                    0 == Digger.countem() && (w[g].level++,
                    1E3 < w[g].level && (w[g].level = 1E3),
                        z());
                    w[g].dead && (w[g].lives--,
                        Drawing.drawlives(),
                    0 != w[g].lives || Input.escape_r() || Scores.endofgame());
                    w[g].levdone && (w[g].level++,
                    1E3 < w[g].level && (w[g].level = 1E3),
                        z())
                })
            }
            function H() {
                1 == k ? (Drawing.outtext("ONE", 220, 25, 3),
                    Drawing.outtext(" PLAYER ", 192, 39, 3)) : (Drawing.outtext("TWO", 220, 25, 3),
                    Drawing.outtext(" PLAYERS", 184, 39, 3))
            }
            function f() {
                k = 3 - k
            }
            function F() {
                if (32 == Input.akeypressed_r()) {
                    Input.akeypressed_w(0);
                    Sound.soundpause();
                    Sound.sett2val(40);
                    Sound.setsoundt2();
                    x();
                    Drawing.outtext("PRESS ANY KEY", 80, 0, 1);
                    Digger.newframe();
                    for (Input.keypressed_w(0); 0 == Input.keypressed_r(); )
                        ;
                    x();
                    Scores.drawscores();
                    Scores.addscore(0);
                    Drawing.drawlives();
                    Digger.newframe();
                    Digger.time_w(Pc.gethrt() - Digger.frametime);
                    Input.keypressed_w(0)
                } else
                    Sound.soundpauseoff()
            }
            var c = [14, 13, 7, 6, 5, 4, 3, 2, 1, 12, 11, 10, 9, 8, 15, 0], w = [new d, new d], b = "", g = 0, k = 0, A = 0, I = !1, v = !1, a, m = ["S   B     HHHHS;V  CC  C  V B  ;VB CC  C  V    ;V  CCB CB V CCC;V  CC  C  V CCC;HH CC  C  V CCC; V    B B V    ; HHHH     V    ;C   V     V   C;CC  HHHHHHH  CC".split(";"), "SHHHHH  B B  HS; CC  V       V ; CC  V CCCCC V ;BCCB V CCCCC V ;CCCC V       V ;CCCC V B  HHHH ; CC  V CC V    ; BB  VCCCCV CC ;C    V CC V CC ;CC   HHHHHH    ".split(";"), "SHHHHB B BHHHHS;CC  V C C V BB ;C   V C C V CC ; BB V C C VCCCC;CCCCV C C VCCCC;CCCCHHHHHHH CC ; CC  C V C  CC ; CC  C V C     ;C    C V C    C;CC   C H C   CC".split(";"), "SHBCCCCBCCCCBHS;CV  CCCCCCC  VC;CHHH CCCCC HHHC;C  V  CCC  V  C;   HHH C HHH   ;  B  V B V  B  ;  C  VCCCV  C  ; CCC HHHHH CCC ;CCCCC CVC CCCCC;CCCCC CHC CCCCC".split(";"), "SHHHHHHHHHHHHHS;VBCCCCBVCCCCCCV;VCCCCCCV CCBC V;V CCCC VCCBCCCV;VCCCCCCV CCCC V;V CCCC VBCCCCCV;VCCBCCCV CCCC V;V CCBC VCCCCCCV;VCCCCCCVCCCCCCV;HHHHHHHHHHHHHHH".split(";"), "SHHHHHHHHHHHHHS;VCBCCV V VCCBCV;VCCC VBVBV CCCV;VCCCHH V HHCCCV;VCC V CVC V CCV;VCCHH CVC HHCCV;VC V CCVCC V CV;VCHHBCCVCCBHHCV;VCVCCCCVCCCCVCV;HHHHHHHHHHHHHHH".split(";"), "SHCCCCCVCCCCCHS; VCBCBCVCBCBCV ;BVCCCCCVCCCCCVB;CHHCCCCVCCCCHHC;CCV CCCVCCC VCC;CCHHHCCVCCHHHCC;CCCCV CVC VCCCC;CCCCHH V HHCCCC;CCCCCV V VCCCCC;CCCCCHHHHHCCCCC".split(";"), "HHHHHHHHHHHHHHS;V CCBCCCCCBCC V;HHHCCCCBCCCCHHH;VBV CCCCCCC VBV;VCHHHCCCCCHHHCV;VCCBV CCC VBCCV;VCCCHHHCHHHCCCV;VCCCC V V CCCCV;VCCCCCV VCCCCCV;HHHHHHHHHHHHHHH".split(";")], C = Math.floor(1E3 / 13);
            return {
                addlife: function(u) {
                    w[u - 1].lives++;
                    Sound.sound1up()
                },
                calibrate: function() {},
                checklevdone: n,
                cleartopline: x,
                drawscreen: q,
                getcplayer: function() {
                    return g
                },
                getlevch: function(u, y, N) {
                    0 == N && N++;
                    return m[N - 1][y].charAt(u)
                },
                getlives: function(u) {
                    return w[u - 1].lives
                },
                incpenalty: function() {
                    A++
                },
                initchars: p,
                initlevel: z,
                levno: E,
                levof10: function() {
                    return 10 < w[g].level ? 10 : w[g].level
                },
                levplan: function() {
                    var u = E();
                    8 < u && (u = (u & 3) + 5);
                    return u
                },
                main: function() {
                    return t.asyncExecutePromiseGeneratorFunction(function*() {
                        var u, y = 0;
                        a = Pc.gethrt();
                        Sprite.setretr(!1);
                        Pc.ginit();
                        Sprite.setretr(!0);
                        Pc.gpal(0);
                        Input.initkeyb();
                        Input.detectjoy();
                        Scores.loadscores();
                        Sound.initsound();
                        k = 1;
                        do {
                            Sound.soundstop();
                            Sprite.setsprorder(c);
                            Drawing.creatembspr();
                            Input.detectjoy();
                            Pc.gclear();
                            Pc.gtitle();
                            Drawing.outtext("D I G G E R", 100, 0, 3);
                            H();
                            Scores.showtable();
                            var N = !1;
                            var M = 1;
                            Digger.time_w(Pc.gethrt());
                            yield new Promise(e=>{
                                    var r = setInterval(function() {
                                        if (N)
                                            clearInterval(r),
                                                e();
                                        else {
                                            N = Input.teststart();
                                            27 == Input.akeypressed_r() && (f(),
                                                H(),
                                                Input.akeypressed_w(0),
                                                Input.keypressed_w(0));
                                            if (0 == M)
                                                for (u = 54; 174 > u; u += 12)
                                                    Drawing.outtext("            ", 164, u, 0);
                                            50 == M && (Sprite.movedrawspr(8, 292, 63),
                                                y = 292);
                                            50 < M && 77 >= M && (y -= 4,
                                                Drawing.drawmon(0, !0, 4, y, 63));
                                            77 < M && Drawing.drawmon(0, !0, 0, 184, 63);
                                            83 == M && Drawing.outtext("NOBBIN", 216, 64, 2);
                                            90 == M && (Sprite.movedrawspr(9, 292, 82),
                                                Drawing.drawmon(1, !1, 4, 292, 82),
                                                y = 292);
                                            90 < M && 117 >= M && (y -= 4,
                                                Drawing.drawmon(1, !1, 4, y, 82));
                                            117 < M && Drawing.drawmon(1, !1, 0, 184, 82);
                                            123 == M && Drawing.outtext("HOBBIN", 216, 83, 2);
                                            130 == M && (Sprite.movedrawspr(0, 292, 101),
                                                Drawing.drawdigger(4, 292, 101, !0),
                                                y = 292);
                                            130 < M && 157 >= M && (y -= 4,
                                                Drawing.drawdigger(4, y, 101, !0));
                                            157 < M && Drawing.drawdigger(0, 184, 101, !0);
                                            163 == M && Drawing.outtext("DIGGER", 216, 102, 2);
                                            178 == M && (Sprite.movedrawspr(1, 184, 120),
                                                Drawing.drawgold(1, 0, 184, 120));
                                            183 == M && Drawing.outtext("GOLD", 216, 121, 2);
                                            198 == M && Drawing.drawemerald(184, 141);
                                            203 == M && Drawing.outtext("EMERALD", 216, 140, 2);
                                            218 == M && Drawing.drawbonus(184, 158);
                                            223 == M && Drawing.outtext("BONUS", 216, 159, 2);
                                            Digger.newframe();
                                            M++;
                                            250 < M && (M = 0)
                                        }
                                    }, C)
                                }
                            );
                            w[0].level = 1;
                            w[0].lives = 3;
                            2 == k ? (w[1].level = 1,
                                w[1].lives = 3) : w[1].lives = 0;
                            Pc.gclear();
                            g = 0;
                            z();
                            g = 1;
                            z();
                            Scores.zeroscores();
                            Digger.bonusvisible_w(!0);
                            2 == k && (v = !0);
                            for (g = 0; (0 != w[0].lives || 0 != w[1].lives) && !Input.escape; ) {
                                for (w[g].dead = !1; !w[g].dead && 0 != w[g].lives && !Input.escape; )
                                    Drawing.initmbspr(),
                                        yield P();
                                0 != w[1 - g].lives && (g = 1 - g,
                                    v = I = !0)
                            }
                        } while (1)
                    })
                },
                play: P,
                randno: function(u) {
                    a = 22695477 * a + 1 & 2147483647;
                    return (a & 2147483647) % u
                },
                setdead: function(u) {
                    w[g].dead = u
                },
                shownplayers: H,
                switchnplayers: f,
                testpause: F,
                getnplayers: function() {
                    return k
                }
            }
        }();
        Monster = function() {
            function d() {
                this.x = this.y = this.h = this.v = this.xr = this.yr = this.dir = this.hdir = this.t = this.hnt = this.death = this.bag = this.dtime = this.stime;
                this.flag = this.nob = this.alive = !1
            }
            function n(a, m) {
                var C;
                var u = 0;
                for (C = 256; 6 > u; u++,
                    C <<= 1)
                    0 != (m & C) && c[a].dir == c[u].dir && 0 == c[u].stime && 0 == c[a].stime && (c[u].dir = Digger.reversedir(c[u].dir))
            }
            function x() {
                var a;
                for (a = 0; 6 > a; a++)
                    if (!c[a].flag) {
                        c[a].flag = !0;
                        c[a].alive = !0;
                        c[a].t = 0;
                        c[a].nob = !0;
                        c[a].hnt = 0;
                        c[a].h = 14;
                        c[a].v = 0;
                        c[a].x = 292;
                        c[a].y = 18;
                        c[a].xr = 0;
                        c[a].yr = 0;
                        c[a].dir = 4;
                        c[a].hdir = 4;
                        w++;
                        k = A;
                        c[a].stime = 5;
                        Sprite.movedrawspr(a + 8, c[a].x, c[a].y);
                        break
                    }
            }
            function q(a, m, C) {
                switch (a) {
                    case 0:
                        if (14 > m && 0 == (p(m + 1, C) & 8192) && (0 == (p(m + 1, C) & 1) || 0 == (p(m, C) & 16)))
                            return !0;
                        break;
                    case 4:
                        if (0 < m && 0 == (p(m - 1, C) & 8192) && (0 == (p(m - 1, C) & 16) || 0 == (p(m, C) & 1)))
                            return !0;
                        break;
                    case 2:
                        if (0 < C && 0 == (p(m, C - 1) & 8192) && (0 == (p(m, C - 1) & 2048) || 0 == (p(m, C) & 64)))
                            return !0;
                        break;
                    case 6:
                        if (9 > C && 0 == (p(m, C + 1) & 8192) && (0 == (p(m, C + 1) & 64) || 0 == (p(m, C) & 2048)))
                            return !0
                }
                return !1
            }
            function p(a, m) {
                return Drawing.field[15 * m + a]
            }
            function z(a) {
                var m;
                var C = 0;
                for (m = 256; 6 > C; C++,
                    m <<= 1)
                    0 != (a & m) && Main.incpenalty(),
                        m <<= 1
            }
            function E(a) {
                c[a].flag && (c[a].flag = c[a].alive = !1,
                    Sprite.erasespr(a + 8),
                Digger.bonusmode_r() && b++)
            }
            function P(a) {
                var m = c[a].x;
                var C = c[a].y;
                if (0 == c[a].xr && 0 == c[a].yr) {
                    c[a].hnt > 30 + (Main.levof10() << 1) && !c[a].nob && (c[a].hnt = 0,
                        c[a].nob = !0);
                    if (Math.abs(Digger.diggery_r() - c[a].y) > Math.abs(Digger.diggerx_r() - c[a].x)) {
                        if (Digger.diggery_r() < c[a].y) {
                            var u = 2;
                            var y = 6
                        } else
                            u = 6,
                                y = 2;
                        if (Digger.diggerx_r() < c[a].x) {
                            var N = 4;
                            var M = 0
                        } else
                            N = 0,
                                M = 4
                    } else
                        Digger.diggerx_r() < c[a].x ? (u = 4,
                            y = 0) : (u = 0,
                            y = 4),
                            Digger.diggery_r() < c[a].y ? (N = 2,
                                M = 6) : (N = 6,
                                M = 2);
                    if (Digger.bonusmode_r()) {
                        var e = u;
                        u = y;
                        y = e;
                        e = N;
                        N = M;
                        M = e
                    }
                    var r = Digger.reversedir(c[a].dir);
                    r == u && (u = N,
                        N = M,
                        M = y,
                        y = r);
                    r == N && (N = M,
                        M = y,
                        y = r);
                    r == M && (M = y,
                        y = r);
                    1 == Main.randno(Main.levof10() + 5) && 6 > Main.levof10() && (e = u,
                        u = M,
                        M = e);
                    q(u, c[a].h, c[a].v) ? r = u : q(N, c[a].h, c[a].v) ? r = N : q(M, c[a].h, c[a].v) ? r = M : q(y, c[a].h, c[a].v) && (r = y);
                    c[a].nob || (r = u);
                    c[a].dir != r && c[a].t++;
                    c[a].dir = r
                }
                if (292 == c[a].x && 0 == c[a].dir || 12 == c[a].x && 4 == c[a].dir || 180 == c[a].y && 6 == c[a].dir || 18 == c[a].y && 2 == c[a].dir)
                    c[a].dir = -1;
                if (4 == c[a].dir || 0 == c[a].dir)
                    c[a].hdir = c[a].dir;
                c[a].nob || Drawing.eatfield(c[a].x, c[a].y, c[a].dir);
                switch (c[a].dir) {
                    case 0:
                        c[a].nob || Drawing.drawrightblob(c[a].x, c[a].y);
                        c[a].x += 4;
                        break;
                    case 4:
                        c[a].nob || Drawing.drawleftblob(c[a].x, c[a].y);
                        c[a].x -= 4;
                        break;
                    case 2:
                        c[a].nob || Drawing.drawtopblob(c[a].x, c[a].y);
                        c[a].y -= 3;
                        break;
                    case 6:
                        c[a].nob || Drawing.drawbottomblob(c[a].x, c[a].y),
                            c[a].y += 3
                }
                c[a].nob || Digger.hitemerald(Math.floor((c[a].x - 12) / 20), Math.floor((c[a].y - 18) / 18), (c[a].x - 12) % 20, (c[a].y - 18) % 18, c[a].dir);
                Digger.digonscr_r() || (c[a].x = m,
                    c[a].y = C);
                0 != c[a].stime && (c[a].stime--,
                    c[a].x = m,
                    c[a].y = C);
                !c[a].nob && 100 > c[a].hnt && c[a].hnt++;
                u = !0;
                r = Drawing.drawmon(a, c[a].nob, c[a].hdir, c[a].x, c[a].y);
                Main.incpenalty();
                0 != (r & 16128) && (c[a].t++,
                    n(a, r),
                    z(r));
                0 != (r & Bags.bagbits()) && (c[a].t++,
                    v = !1,
                    4 == c[a].dir || 0 == c[a].dir ? (u = Bags.pushbags(c[a].dir, r),
                        c[a].t++) : Bags.pushudbags(r) || (u = !1),
                v && (c[a].t = 0),
                !c[a].nob && 1 < c[a].hnt && Bags.removebags(r));
                c[a].nob && 0 != (r & 16128) && Digger.digonscr_r() && c[a].hnt++;
                u || (c[a].x = m,
                    c[a].y = C,
                    Drawing.drawmon(a, c[a].nob, c[a].hdir, c[a].x, c[a].y),
                    Main.incpenalty(),
                c[a].nob && c[a].hnt++,
                2 != c[a].dir && 6 != c[a].dir || !c[a].nob || (c[a].dir = Digger.reversedir(c[a].dir)));
                0 != (r & 1) && Digger.digonscr_r() && (Digger.bonusmode_r() ? (E(a),
                    Scores.scoreeatm(),
                    Sound.soundeatm()) : Digger.killdigger(3, 0));
                c[a].h = Math.floor((c[a].x - 12) / 20);
                c[a].v = Math.floor((c[a].y - 18) / 18);
                c[a].xr = (c[a].x - 12) % 20;
                c[a].yr = (c[a].y - 18) % 18
            }
            function H(a) {
                switch (c[a].death) {
                    case 1:
                        Bags.bagy(c[a].bag) + 6 > c[a].y && (c[a].y = Bags.bagy(c[a].bag));
                        Drawing.drawmondie(a, c[a].nob, c[a].hdir, c[a].x, c[a].y);
                        Main.incpenalty();
                        -1 == Bags.getbagdir(c[a].bag) && (c[a].dtime = 1,
                            c[a].death = 4);
                        break;
                    case 4:
                        0 != c[a].dtime ? c[a].dtime-- : (E(a),
                            Scores.scorekill())
                }
            }
            function f() {
                var a, m = 0;
                for (a = 0; 6 > a; a++)
                    c[a].flag && m++;
                return m
            }
            function F(a, m, C) {
                c[a].alive = !1;
                c[a].death = m;
                c[a].bag = C
            }
            var c = [new d, new d, new d, new d, new d, new d]
                , w = 0
                , b = 0
                , g = 0
                , k = 0
                , A = 0
                , I = !1
                , v = !1;
            return {
                checkcoincide: n,
                checkmonscared: function(a) {
                    var m;
                    for (m = 0; 6 > m; m++)
                        a == c[m].h && 2 == c[m].dir && (c[m].dir = 6)
                },
                createmonster: x,
                domonsters: function() {
                    var a;
                    0 < k ? k-- : (w < b && f() < g && Digger.digonscr_r() && !Digger.bonusmode_r() && x(),
                    I && w == b && 0 == k && Digger.digonscr_r() && (I = !1,
                        Digger.createbonus()));
                    for (a = 0; 6 > a; a++)
                        c[a].flag && (c[a].hnt > 10 - Main.levof10() && c[a].nob && (c[a].nob = !1,
                            c[a].hnt = 0),
                            c[a].alive ? 0 == c[a].t ? (P(a),
                            0 == Main.randno(15 - Main.levof10()) && c[a].nob && P(a)) : c[a].t-- : H(a))
                },
                erasemonsters: function() {
                    var a;
                    for (a = 0; 6 > a; a++)
                        c[a].flag && Sprite.erasespr(a + 8)
                },
                fieldclear: q,
                getfield: p,
                incmont: function(a) {
                    var m;
                    6 < a && (a = 6);
                    for (m = 1; m < a; m++)
                        c[m].t++
                },
                incpenalties: z,
                initmonsters: function() {
                    var a;
                    for (a = 0; 6 > a; a++)
                        c[a].flag = !1;
                    w = 0;
                    A = 45 - (Main.levof10() << 1);
                    b = Main.levof10() + 5;
                    switch (Main.levof10()) {
                        case 1:
                            g = 3;
                            break;
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 7:
                            g = 4;
                            break;
                        case 8:
                        case 9:
                        case 10:
                            g = 5
                    }
                    k = 10;
                    I = !0
                },
                killmon: E,
                killmonsters: function(a) {
                    var m, C = 0;
                    var u = 0;
                    for (m = 256; 6 > u; u++,
                        m <<= 1)
                        0 != (a & m) && (E(u),
                            C++);
                    return C
                },
                monai: P,
                mondie: H,
                mongold: function() {
                    v = !0
                },
                monleft: function() {
                    return f() + b - w
                },
                nmononscr: f,
                squashmonster: F,
                squashmonsters: function(a, m) {
                    var C;
                    var u = 0;
                    for (C = 256; 6 > u; u++,
                        C <<= 1)
                        0 != (m & C) && c[u].y >= Bags.bagy(a) && F(u, 1, a)
                }
            }
        }();
        Pc = function() {
            var d = Array(16384)
                , n = 0
                , x = [[[0, 0, 204, 204], [0, 204, 0, 116], [0, 0, 0, 0]], [[0, 100, 255, 255], [0, 255, 100, 255], [0, 100, 100, 100]]];
            return {
                gclear: function() {
                    for (var q = Digger.getgpix(), p = 0, z = 16E3; p < z; p++)
                        d[p] = 0;
                    p = 0;
                    for (z = 256E3; p < z; )
                        q[p++] = 0,
                            q[p++] = 0,
                            q[p++] = 0,
                            p++
                },
                gethrt: function() {
                    return Date.now()
                },
                getkips: function() {
                    return 0
                },
                ggeti: function(q, p, z, E, P) {
                    var H = 0;
                    q = 320 * p + q >> 2;
                    for (p = 0; p < P; p++) {
                        for (var f = q, F = 0; F < E; F++)
                            if (z[H++] = d[f++],
                            H == z.length)
                                return;
                        q += 80
                    }
                },
                ggetpix: function(q, p) {
                    return d[320 * p + q >> 2]
                },
                ginit: function() {},
                ginten: function(q) {
                    if (!(n == q & 1)) {
                        n = q & 1;
                        q = Digger.getgpix();
                        for (var p = x[n], z = 0, E = 0; 16E3 > z; z++)
                            for (var P = d[z], H = 0; 4 > H; H++)
                                q[E++] = p[0][P & 3],
                                    q[E++] = p[1][P & 3],
                                    q[E++] = p[2][P & 3],
                                    E++,
                                    P >>= 2
                    }
                },
                gpal: function() {},
                gputi: function(q, p, z, E, P) {
                    var H = 0;
                    q = 320 * p + q >> 2;
                    p = Digger.getgpix();
                    for (var f = x[n], F = 0; F < P; F++) {
                        for (var c = q, w = c << 4, b = 0; b < E; b++) {
                            var g = z[H++];
                            d[c++] = g;
                            for (var k = 0; 4 > k; k++,
                                g >>= 2)
                                p[w++] = f[0][g & 3],
                                    p[w++] = f[1][g & 3],
                                    p[w++] = f[2][g & 3],
                                    w++;
                            if (H == z.length)
                                return
                        }
                        q += 80
                    }
                },
                gputim: function(q, p, z, E, P) {
                    var H = xa.cgatable[2 * z];
                    z = xa.cgatable[2 * z + 1];
                    var f = 0;
                    q = 320 * p + q >> 2;
                    p = Digger.getgpix();
                    for (var F = x[n], c = 0; c < P; c++) {
                        for (var w = q, b = q << 4, g = 0; g < E; g++) {
                            var k = H[f]
                                , A = z[f]
                                , I = d[w];
                            f++;
                            0 == (A & 3) && (I = I & -193 | (k & 3) << 6,
                                p[b + 0 + 12] = F[0][k & 3],
                                p[b + 1 + 12] = F[1][k & 3],
                                p[b + 2 + 12] = F[2][k & 3]);
                            k >>= 2;
                            0 == (A & 12) && (I = I & -49 | (k & 3) << 4,
                                p[b + 0 + 8] = F[0][k & 3],
                                p[b + 1 + 8] = F[1][k & 3],
                                p[b + 2 + 8] = F[2][k & 3]);
                            k >>= 2;
                            0 == (A & 48) && (I = I & -13 | (k & 3) << 2,
                                p[b + 0 + 4] = F[0][k & 3],
                                p[b + 1 + 4] = F[1][k & 3],
                                p[b + 2 + 4] = F[2][k & 3]);
                            k >>= 2;
                            0 == (A & 192) && (I = I & -4 | k & 3,
                                p[b + 0] = F[0][k & 3],
                                p[b + 1] = F[1][k & 3],
                                p[b + 2] = F[2][k & 3]);
                            d[w] = I;
                            w += 1;
                            b += 16;
                            if (f == H.length || f == z.length)
                                return
                        }
                        q += 80
                    }
                },
                gtitle: function() {
                    for (var q = 0, p = 0, z = Digger.getgpix(), E = x[n]; !(q >= xa.cgatitledat.length); ) {
                        var P = xa.cgatitledat[q++];
                        if (254 == P) {
                            var H = xa.cgatitledat[q++];
                            0 == H && (H = 256);
                            P = xa.cgatitledat[q++]
                        } else
                            H = 1;
                        for (var f = 0; f < H; f++) {
                            var F = P;
                            var c = 32768 > p ? 640 * Math.floor(p / 320) + p % 320 : 320 + 640 * Math.floor((p - 32768) / 320) + (p - 32768) % 320;
                            d[c >> 2] = F >> 6 | F >> 2 & 12 | F << 2 & 48 | F << 6 & 192;
                            var w = 0;
                            for (c = (c << 2) + 12; 4 > w; w++,
                                F >>= 2,
                                c -= 8)
                                z[c++] = E[0][F & 3],
                                    z[c++] = E[1][F & 3],
                                    z[c++] = E[2][F & 3],
                                    c++;
                            p += 4;
                            if (65535 <= p)
                                break
                        }
                        if (65535 <= p)
                            break
                    }
                },
                gwrite: function(q, p, z, E) {
                    E &= 3;
                    q = 320 * p + q >> 2;
                    p = 0;
                    var P = E | E << 2 | E << 4 | E << 6
                        , H = Digger.getgpix()
                        , f = x[n];
                    z = z.charCodeAt(0) - 32;
                    if (!(0 > z || 95 < z) && (z = Ga.ascii2cga[z],
                    null != z))
                        for (var F = 0; 12 > F; F++) {
                            for (var c = q, w = 0; 3 > w; w++) {
                                var b = z[p++];
                                d[c] = (b >> 6 | b >> 2 & 12 | b << 2 & 48 | b << 6 & 192) & P;
                                for (var g = 0, k = (c << 4) + 12; 4 > g; g++,
                                    b >>= 2,
                                    k -= 8)
                                    H[k++] = f[0][b & E],
                                        H[k++] = f[1][b & E],
                                        H[k++] = f[2][b & E],
                                        k++;
                                c++
                            }
                            q += 80
                        }
                },
                pixels: d
            }
        }();
        Scores = function() {
            function d(v) {
                0 == Main.getcplayer() ? (c += v,
                999999 < c && (c = 0),
                    E(c, 0, 0, 6, 1),
                c >= b && (5 > Main.getlives(1) && (Main.addlife(1),
                    Drawing.drawlives()),
                    b += 2E4)) : (w += v,
                999999 < w && (w = 0),
                    1E5 > w ? E(w, 236, 0, 6, 1) : E(w, 248, 0, 6, 1),
                w > g && (5 > Main.getlives(2) && (Main.addlife(2),
                    Drawing.drawlives()),
                    g += 2E4));
                Main.incpenalty();
                Main.incpenalty();
                Main.incpenalty()
            }
            function n() {
                E(c, 0, 0, 6, 3);
                2 == Main.getnplayers() && (1E5 > w ? E(w, 236, 0, 6, 3) : E(w, 248, 0, 6, 3))
            }
            function x(v, a) {
                var m, C;
                Input.keypressed_w(0);
                Pc.gwrite(v, a, "_", 3, !0);
                for (C = 0; 5 > C; C++) {
                    for (m = 0; 40 > m; m++)
                        if (0 == (Input.keypressed_r() & 128) && 0 != Input.keypressed_r())
                            return Input.keypressed_r();
                    for (m = 0; 40 > m; m++)
                        if (0 == (Input.keypressed_r() & 128) && 0 != Input.keypressed_r())
                            return Pc.gwrite(v, a, "_", 3, !0),
                                Input.keypressed_r()
                }
                I = !0;
                return 0
            }
            function q() {
                var v, a;
                Drawing.outtext("ENTER YOUR", 100, 70, 3, !0);
                Drawing.outtext(" INITIALS", 100, 90, 3, !0);
                Drawing.outtext("_ _ _", 128, 130, 3, !0);
                f[0] = "...";
                Sound.killsound();
                I = !1;
                for (a = 0; 3 > a; a++) {
                    for (v = 0; 0 == v && !I; )
                        v = x(24 * a + 128, 130),
                        0 != a && 8 == v && a--,
                            v = Input.getasciikey(v);
                    0 != v && Pc.gwrite(24 * a + 128, 130, v, 3, !0)
                }
                Input.keypressed_w(0);
                for (a = 0; 20 > a; a++)
                    ;
                Sound.setupsound();
                Pc.gclear();
                Pc.gpal(0);
                Pc.ginten(0);
                Digger.newframe();
                Sprite.setretr(!0)
            }
            function p(v) {
                var a, m = "";
                for (a = 0; 6 > a; a++)
                    if (m = String(v % 10) + m,
                        v = Math.floor(v / 10),
                    0 == v) {
                        a++;
                        break
                    }
                for (; 6 > a; a++)
                    m = " " + m;
                return m
            }
            function z() {
                var v, a;
                for (a = 10; 1 < a && !(F < H[a]); a--)
                    ;
                for (v = 10; v > a; v--)
                    H[v + 1] = H[v],
                        f[v] = f[v - 1];
                H[a + 1] = F;
                f[a] = f[0]
            }
            function E(v, a, m, C, u) {
                for (var y = 12 * (C - 1) + a; 0 < C; )
                    a = v % 10,
                    (1 < C || 0 < a) && Pc.gwrite(y, m, a + "0", u, !1),
                        v = Math.floor(v / 10),
                        C--,
                        y -= 12
            }
            var P = Array(10), H = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], f = Array(11), F = 0, c = 0, w = 0, b = 0, g = 0, k, A = Array(512), I = !1;
            return {
                addscore: d,
                drawscores: n,
                endofgame: function() {
                    var v;
                    d(0);
                    F = 0 == Main.getcplayer() ? c : w;
                    if (F > H[11]) {
                        Pc.gclear();
                        n();
                        Drawing.outtext("PLAYER " + (Main.getcplayer() + 1), 108, 0, 2, !0);
                        Drawing.outtext(" NEW HIGH SCORE ", 64, 40, 2, !0);
                        q();
                        z();
                        var a = "";
                        for (v = 0; 10 > v; v++)
                            a += (0 < v ? " " : "") + H[v + 2];
                        window.localStorage.setItem("ds", a)
                    } else {
                        Main.cleartopline();
                        Drawing.outtext("GAME OVER", 104, 0, 3, !0);
                        Sound.killsound();
                        for (a = 0; 20 > a; a++)
                            for (v = 0; 2 > v; v++)
                                Sprite.setretr(!0),
                                    Pc.gpal(1 - (a & 1)),
                                    Sprite.setretr(!1),
                                    Pc.gpal(0),
                                    Pc.ginten(1 - v & 1),
                                    Digger.newframe();
                        Sound.setupsound();
                        Drawing.outtext("         ", 104, 0, 3, !0);
                        Sprite.setretr(!0)
                    }
                },
                flashywait: function() {},
                getinitial: x,
                getinitials: q,
                initscores: function() {
                    d(0)
                },
                loadscores: function() {
                    var v = 1, a, m;
                    for (a = 1; 11 > a; a++) {
                        for (m = 0; 3 > m; m++)
                            f[a] = "...";
                        v += 2;
                        for (m = 0; 6 > m; m++)
                            P[m] = A[v++];
                        H[a + 1] = 0
                    }
                    if ("s" != A[0])
                        for (a = 0; 11 > a; a++)
                            H[a + 1] = 0,
                                f[a] = "...";
                    if (a = window.localStorage.getItem("ds"))
                        for (v = a.split(" "),
                                 a = 0; a < v.length && 11 > a; a++)
                            H[a + 2] = v[a]
                },
                numtostring: p,
                scorebonus: function() {
                    d(1E3)
                },
                scoreeatm: function() {
                    d(200 * Digger.eatmsc_r());
                    Digger.eatmsc_w(Digger.eatmsc_r() << 1)
                },
                scoreemerald: function() {
                    d(25)
                },
                scoregold: function() {
                    d(500)
                },
                scorekill: function() {
                    d(250)
                },
                scoreoctave: function() {
                    d(250)
                },
                showtable: function() {
                    var v;
                    Drawing.outtext("HIGH SCORES", 16, 25, 3);
                    var a = 2;
                    for (v = 1; 11 > v; v++)
                        k = f[v] + "  " + p(H[v + 1]),
                            Drawing.outtext(k, 16, 31 + 13 * v, a),
                            a = 1
                },
                shufflehigh: z,
                writecurscore: function(v) {
                    0 == Main.getcplayer() ? E(c, 0, 0, 6, v) : 1E5 > w ? E(w, 236, 0, 6, v) : E(w, 248, 0, 6, v)
                },
                writenum: E,
                zeroscores: function() {
                    F = c = w = 0;
                    g = b = 2E4
                }
            }
        }();
        Sound = function() {
            function d() {
                eb = !1;
                ea = 0
            }
            function n() {
                if (eb) {
                    if (0 != ra)
                        ra--;
                    else
                        switch (Xa = fb = 0,
                            rb) {
                            case 0:
                                ra = 3 * gb[ea + 1];
                                Ya = ra - 3;
                                Za = gb[ea];
                                ea += 2;
                                32100 == gb[ea] && (ea = 0);
                                break;
                            case 1:
                                ra = 6 * hb[ea + 1];
                                Ya = 12;
                                Za = hb[ea];
                                ea += 2;
                                32100 == hb[ea] && (ea = 0);
                                break;
                            case 2:
                                ra = 10 * ib[ea + 1],
                                    Ya = ra - 10,
                                    Za = ib[ea],
                                    ea += 2,
                                32100 == ib[ea] && (ea = 0)
                        }
                    fb++;
                    O = 1;
                    L = Za;
                    fb >= Ya && (Xa = 2);
                    switch (Xa) {
                        case 0:
                            if (J + Ia >= Ja) {
                                Xa = 1;
                                J = Ja;
                                break
                            }
                            J += Ia;
                            break;
                        case 1:
                            if (J - Ka <= La) {
                                J = La;
                                break
                            }
                            J -= Ka;
                            break;
                        case 2:
                            J = 1 >= J - Ma ? 1 : J - Ma
                    }
                    1 == J && (L = 32E3)
                }
            }
            function x() {
                h = O;
                !Na && da && (sa = Na = !0)
            }
            function q() {
                Na && (h = 0,
                    Na = !1,
                    sa = !0)
            }
            function p() {
                da && (R(D),
                1E3 > L && (1 == O || 2 == O) && (L = 1E3),
                    V(L),
                    l = L,
                1 > J && (J = 1),
                50 < J && (J = 50),
                    ja = J * na,
                    x())
            }
            function z(T) {
                da && R(T)
            }
            function E() {
                Oa && (0 != Math.floor(Pa / 3) % 2 && (D = (Pa << 2) + 600),
                    Pa--,
                1 > Pa && (Oa = !1))
            }
            function P() {
                Ha = !1;
                ta = 0
            }
            function H() {
                Ha && (ta++,
                15 < ta && (ta = 0),
                0 <= ta && 6 > ta && (D = 1230),
                8 <= ta && 14 > ta && (D = 1513))
            }
            function f() {
                B && (0 != G ? (G--,
                    D = S) : B = !1)
            }
            function F() {
                Ca && (ya++,
                1 == ya && d(),
                1 <= ya && 10 >= ya && (Qa = 2E4 - 1E3 * ya),
                10 < ya && (Qa += 500),
                3E4 < Qa && (Ca = !1),
                    D = Qa)
            }
            function c() {
                Ra && (0 != jb ? 0 != Da ? (1 == Da % 4 && (D = za),
                3 == Da % 4 && (D = za - (za >> 4)),
                    Da--,
                    za -= za >> 4) : (Da = 20,
                    jb--,
                    za = 2E3) : Ra = !1)
            }
            function w() {
                if (Sa)
                    if (0 != kb) {
                        if (0 == Ea || 1 == Ea)
                            D = sb;
                        Ea++;
                        7 < Ea && (Ea = 0,
                            kb--)
                    } else
                        Sa = !1
            }
            function b() {
                Ta && (D = 1E3,
                    Ta = !1)
            }
            function g() {
                X && (0 != pa ? (Z = D = Z - (Z >> 3),
                    pa--) : X = !1)
            }
            function k() {
                ka = !1;
                Aa = 0
            }
            function A() {
                ka && (1 > Aa ? (Aa++,
                qa && (D = Ba)) : (Aa = 0,
                    qa ? (Ba += 50,
                        qa = !1) : qa = !0))
            }
            function I() {
                la = !1;
                Y = 0
            }
            function v() {
                la && (1 == Y ? (Y = 0,
                    ma += Math.floor(ma / 55),
                    D = ma + Main.randno(ma >> 3),
                3E4 < ma && I()) : Y++)
            }
            function a() {
                Ua && (0 != lb ? lb-- : Ua = !1,
                    $a ? ($a = !1,
                        D = ab) : ($a = !0,
                        D = bb),
                    ab += ab >> 4,
                    bb -= bb >> 4)
            }
            function m() {
                va++;
                wa && !da && (da = oa = !0);
                !wa && da && (da = !1,
                    R(40),
                    q(),
                    sa = !1);
                da && !fa && (L = 32E3,
                    D = 40,
                oa && n(),
                    w(),
                    M(),
                    F(),
                    f(),
                    a(),
                    b(),
                    g(),
                    v(),
                    c(),
                    A(),
                    E(),
                    H(),
                    32E3 == L || 40 != D ? q() : (x(),
                        p()),
                    z(D))
            }
            function C() {
                ba = fa = !1
            }
            function u() {
                da ? (11 > ia && (D = ua[ia]),
                    L = D + 35,
                    J = 50,
                    x(),
                    p(),
                    z(D),
                    0 < ha ? ha-- : (ha = 20,
                        ia++,
                    10 < ia && C())) : ba = !1
            }
            function y() {
                k();
                N();
                I();
                d();
                P();
                Oa = Ca = Ra = Ua = Sa = Ta = B = X = !1
            }
            function N() {
                W = !1;
                aa = 0
            }
            function M() {
                if (W)
                    switch (aa++,
                    63 < aa && (aa = 0),
                        aa) {
                        case 0:
                            D = 2E3;
                            break;
                        case 16:
                        case 48:
                            D = 2500;
                            break;
                        case 32:
                            D = 3E3
                    }
            }
            function e() {
                Va || (l = 16384,
                    V(16384),
                    Va = !0)
            }
            function r() {
                V(0);
                Va && (Va = !1);
                z(40);
                sa = !0
            }
            function Q() {
                Digger.curtime = 0;
                e()
            }
            function R(T) {
                mb = 40 == T ? 0 : 0 == T ? Wa : Math.floor((Wa << 16) / T)
            }
            function V(T) {
                tb = 0 == T ? Wa : Math.floor((Wa << 16) / T)
            }
            function U() {
                var T, Fa;
                "AudioContext"in window && (T = new AudioContext);
                if (T) {
                    Wa = Math.floor(1193181 / T.sampleRate);
                    sa = !1;
                    var td = function() {
                        T.state && "suspended" == T.state && T.resume();
                        Fa = T.createScriptProcessor(2048, 1, 1);
                        Fa.onaudioprocess = function(cb) {
                            cb = cb.outputBuffer.getChannelData(0);
                            for (var nb = 0; nb < cb.length; nb++) {
                                var rd = nb
                                    , ub = 0
                                    , vb = 0;
                                db += tb;
                                65536 <= db && (db %= 65536,
                                    K += l,
                                65536 <= K && (K %= 65536,
                                    m(),
                                    K -= 16384,
                                0 > K && (K += 65536)));
                                ob = (ob + mb) % 65536;
                                0 != h && (ub = db > 63 * ja ? -32767 : 32767);
                                0 != mb && sa && (vb = 32767 < ob ? -32767 : 32767);
                                cb[rd] = (ub + 2 * vb + 98301) * (sd - wb) / 196605 + wb
                            }
                        }
                        ;
                        Fa.connect(T.destination)
                    };
                    window.acon = T;
                    window.anode = Fa;
                    window.fuinput = function() {
                        td();
                        window.fuinput = null
                    }
                }
            }
            var O = 0, J = 0, h = 0, l = 2E3, K = 0, D = 0, L = 0, ja = 1, na = 1, va = 0, wa = !0, oa = !0, da = !1, fa = !1, ba = !1, ia = 0, ha = 0, ua = [2280, 1810, 1522, 2032, 1708, 1356, 1810, 1522, 1208, 1140, 1140], ka = !1, qa = !1, Ba, Aa = 0, B = !1, G = 0, S = 0, W = !1, aa = 0, la = !1, ma, Y = 0, X = !1, Z, pa, Ha = !1, ta = 0, Ta = !1, Sa = !1, kb, sb, Ea, ud = [2280, 2032, 1810, 1708, 1522, 1356, 1208, 1140], Ua = !1, $a = !1, ab, bb, lb, Ra = !1, za, Da, jb, Ca = !1, ya, Qa, Oa = !1, Pa = 0, eb = !1, ea = 0, rb = 0, ra = 0, Za = 0, Ja = 0, Ia = 0, La = 0, Ka = 0, Ya = 0, Ma = 0, Xa = 0, fb = 0, gb = [4561, 2, 4561, 2, 4561, 4, 4561, 2, 4561, 2, 4561, 4, 4561, 2, 4561, 2, 3417, 4, 3044, 4, 2712, 4, 4561, 2, 4561, 2, 4561, 4, 4561, 2, 4561, 2, 4561, 4, 3417, 2, 2712, 2, 3044, 4, 3620, 4, 4561, 4, 4561, 2, 4561, 2, 4561, 4, 4561, 2, 4561, 2, 4561, 4, 4561, 2, 4561, 2, 3417, 4, 3044, 4, 2712, 4, 3417, 2, 2712, 2, 2280, 10, 2560, 2, 2712, 2, 3044, 2, 3417, 4, 2712, 4, 3417, 4, 4561, 2, 4561, 2, 4561, 4, 4561, 2, 4561, 2, 4561, 4, 4561, 2, 4561, 2, 3417, 4, 3044, 4, 2712, 4, 4561, 2, 4561, 2, 4561, 4, 4561, 2, 4561, 2, 4561, 4, 3417, 2, 2712, 2, 3044, 4, 3620, 4, 4561, 4, 4561, 2, 4561, 2, 4561, 4, 4561, 2, 4561, 2, 4561, 4, 4561, 2, 4561, 2, 3417, 4, 3044, 4, 2712, 4, 3417, 2, 2712, 2, 2280, 10, 2560, 2, 2712, 2, 3044, 2, 3417, 4, 2712, 4, 3417, 4, 2712, 2, 2712, 2, 2712, 4, 2712, 2, 2712, 2, 2712, 4, 2712, 2, 2712, 2, 2712, 4, 2032, 4, 2712, 4, 2032, 4, 2712, 4, 2032, 4, 2712, 4, 3044, 4, 3417, 4, 3620, 4, 4063, 4, 2712, 2, 2712, 2, 2712, 4, 2712, 2, 2712, 2, 2712, 4, 2712, 2, 2712, 2, 2712, 4, 2032, 4, 2712, 4, 2032, 4, 2712, 4, 2032, 4, 2280, 4, 2416, 4, 2280, 4, 2416, 4, 2280, 4, 2712, 2, 2712, 2, 2712, 4, 2712, 2, 2712, 2, 2712, 4, 2712, 2, 2712, 2, 2712, 4, 2032, 4, 2712, 4, 2032, 4, 2712, 4, 2032, 4, 2712, 4, 3044, 4, 3417, 4, 3620, 4, 4063, 4, 2712, 2, 2712, 2, 2712, 4, 2712, 2, 2712, 2, 2712, 4, 2712, 2, 2712, 2, 2712, 4, 2032, 4, 2712, 4, 2032, 4, 2712, 4, 2032, 4, 2280, 4, 2416, 4, 2280, 4, 2416, 4, 2280, 4, 32100], hb = [4063, 2, 4561, 2, 4063, 2, 5424, 2, 6834, 2, 5424, 2, 8127, 4, 4063, 2, 4561, 2, 4063, 2, 5424, 2, 6834, 2, 5424, 2, 8127, 4, 4063, 2, 3620, 2, 3417, 2, 3620, 2, 3417, 2, 4063, 2, 3620, 2, 4063, 2, 3620, 2, 4561, 2, 4063, 2, 4561, 2, 4063, 2, 5120, 2, 4063, 4, 4063, 2, 4561, 2, 4063, 2, 5424, 2, 6834, 2, 5424, 2, 8127, 4, 4063, 2, 4561, 2, 4063, 2, 5424, 2, 6834, 2, 5424, 2, 8127, 4, 4063, 2, 3620, 2, 3417, 2, 3620, 2, 3417, 2, 4063, 2, 3620, 2, 4063, 2, 3620, 2, 4561, 2, 4063, 2, 4561, 2, 4063, 2, 3620, 2, 3417, 4, 2712, 2, 3044, 2, 2712, 2, 3417, 2, 4561, 2, 3417, 2, 5424, 4, 2712, 2, 3044, 2, 2712, 2, 3417, 2, 4561, 2, 3417, 2, 5424, 4, 2712, 2, 2416, 2, 2280, 2, 2416, 2, 2280, 2, 2712, 2, 2416, 2, 2712, 2, 2416, 2, 3044, 2, 2712, 2, 3044, 2, 2712, 2, 3417, 2, 2712, 4, 2712, 2, 3044, 2, 2712, 2, 3417, 2, 4561, 2, 3417, 2, 5424, 4, 2712, 2, 3044, 2, 2712, 2, 3417, 2, 4561, 2, 3417, 2, 5424, 4, 2712, 2, 2416, 2, 2280, 2, 2416, 2, 2280, 2, 2712, 2, 2416, 2, 2712, 2, 2416, 2, 3044, 2, 2712, 2, 3044, 2, 2712, 2, 3417, 2, 2712, 4, 2032, 2, 2280, 2, 2712, 2, 3417, 2, 4561, 2, 3417, 2, 5424, 4, 2712, 2, 3044, 2, 2712, 2, 3417, 2, 4561, 2, 3417, 2, 5424, 4, 2712, 2, 2416, 2, 2280, 2, 2416, 2, 2280, 2, 2712, 2, 2416, 2, 2712, 2, 2416, 2, 3044, 2, 2712, 2, 3044, 2, 3417, 2, 3044, 2, 2712, 4, 32100], ib = [32E3, 2, 4561, 6, 4561, 4, 4561, 2, 4561, 6, 3835, 4, 4063, 2, 4063, 4, 4561, 2, 4561, 4, 4832, 2, 4561, 12, 32E3, 16, 32E3, 16, 32E3, 16, 32E3, 16, 32E3, 16, 32E3, 16, 32E3, 16, 32E3, 16, 32E3, 16, 32E3, 16, 32E3, 16, 32E3, 16, 32100], Na = !1, Va = !1, wb = -.3, sd = .3, Wa, tb, mb, db = 0, ob = 0, sa;
            return {
                initsound: function() {
                    U();
                    R(40);
                    sa = !0;
                    V(0);
                    O = 2;
                    L = 12E3;
                    J = 8;
                    D = 40;
                    da = Na = !0;
                    h = 0;
                    Va = !1;
                    q();
                    y();
                    Q();
                    l = 16384;
                    V(16384)
                },
                setupsound: Q,
                killsound: function() {
                    q();
                    R(40);
                    r()
                },
                soundoff: function() {
                    sa = !1
                },
                music: function(T) {
                    rb = T;
                    ra = ea = 0;
                    switch (T) {
                        case 0:
                            Ja = 50;
                            La = Ia = 20;
                            Ka = 10;
                            Ma = 4;
                            break;
                        case 1:
                            Ia = Ja = 50;
                            La = 8;
                            Ka = 15;
                            Ma = 1;
                            break;
                        case 2:
                            Ia = Ja = 50,
                                La = 25,
                                Ka = 5,
                                Ma = 1
                    }
                    eb = !0;
                    2 == T && (Ca = !1)
                },
                musicoff: d,
                musicupdate: n,
                setsoundmode: x,
                setsoundt2: q,
                sett0: p,
                sett2val: z,
                sound1up: function() {
                    Pa = 96;
                    Oa = !0
                },
                sound1upoff: function() {
                    Oa = !1
                },
                sound1upupdate: E,
                soundbonus: function() {
                    Ha = !0
                },
                soundbonusoff: P,
                soundbonusupdate: H,
                soundbreak: function() {
                    G = 3;
                    15E3 > S && (S = 15E3);
                    B = !0
                },
                soundbreakoff: function() {
                    B = !1
                },
                soundbreakupdate: f,
                soundddie: function() {
                    ya = 0;
                    Qa = 2E4;
                    Ca = !0
                },
                soundddieoff: function() {
                    Ca = !1
                },
                soundddieupdate: F,
                soundeatm: function() {
                    Da = 20;
                    jb = 3;
                    za = 2E3;
                    Ra = !0
                },
                soundeatmoff: function() {
                    Ra = !1
                },
                soundeatmupdate: c,
                soundem: function() {
                    Ta = !0
                },
                soundemerald: function(T) {
                    sb = ud[T];
                    kb = 7;
                    Ea = 0;
                    Sa = !0
                },
                soundemeraldoff: function() {
                    Sa = !1
                },
                soundemeraldupdate: w,
                soundemoff: function() {
                    Ta = !1
                },
                soundemupdate: b,
                soundexplode: function() {
                    Z = 1500;
                    pa = 10;
                    X = !0;
                    I()
                },
                soundexplodeoff: function() {
                    X = !1
                },
                soundexplodeupdate: g,
                soundfall: function() {
                    Ba = 1E3;
                    ka = !0
                },
                soundfalloff: k,
                soundfallupdate: A,
                soundfire: function() {
                    ma = 500;
                    la = !0
                },
                soundfireoff: I,
                soundfireupdate: v,
                soundgold: function() {
                    ab = 500;
                    bb = 4E3;
                    lb = 30;
                    $a = !1;
                    Ua = !0
                },
                soundgoldoff: function() {
                    Ua = !1
                },
                soundgoldupdate: a,
                soundint: m,
                soundlevdone: function() {
                    return t.asyncExecutePromiseGeneratorFunction(function*() {
                        y();
                        ia = 0;
                        ha = 20;
                        ba = !0;
                        yield new Promise(T=>{
                                var Fa = setInterval(()=>{
                                        ba ? u() : (clearInterval(Fa),
                                            T())
                                    }
                                    , 15)
                            }
                        );
                        C()
                    })
                },
                soundlevdoneoff: C,
                soundlevdoneupdate: u,
                soundlevdoneloop: function() {
                    return ba
                },
                soundpause: function() {
                    fa = !0
                },
                soundpauseoff: function() {
                    fa = !1
                },
                soundstop: y,
                soundwobble: function() {
                    W = !0
                },
                soundwobbleoff: N,
                soundwobbleupdate: M,
                startint8: e,
                stopint8: r,
                getmusicflag: function() {
                    return oa
                },
                getvolume: function() {
                    return na
                },
                setvolume: function(T) {
                    na = T
                },
                setaudio: function(T) {
                    wa = T
                }
            }
        }();
        Sprite = function() {
            function d(e, r) {
                if (b[e] >= b[r]) {
                    if (b[e] + I[e] > 4 * k[r] + b[r] - I[r] - 1)
                        return !1
                } else if (b[r] + I[r] > 4 * k[e] + b[e] - I[e] - 1)
                    return !1;
                return g[e] >= g[r] ? g[e] + v[e] <= A[r] + g[r] - v[r] - 1 ? !0 : !1 : g[r] + v[r] <= A[e] + g[e] - v[e] - 1 ? !0 : !1
            }
            function n(e) {
                var r = e
                    , Q = 0
                    , R = 0;
                e = 0;
                do
                    F[e] && e != r && (d(e, r) && (Q |= 1 << R),
                        b[e] += 320,
                        g[e] -= 2,
                    d(e, r) && (Q |= 1 << R),
                        b[e] -= 640,
                        g[e] += 4,
                    d(e, r) && (Q |= 1 << R),
                        b[e] += 320,
                        g[e] -= 2),
                        e++,
                        R++;
                while (16 != R);
                return Q
            }
            function x() {
                var e;
                q();
                for (e = 0; 17 > e; e++)
                    H[e] = !1
            }
            function q() {
                var e;
                for (e = 0; 17 > e; e++)
                    f[e] = !1
            }
            function p(e, r) {
                if (b[e] >= b[r]) {
                    if (b[e] > 4 * k[r] + b[r] - 1)
                        return !1
                } else if (b[r] > 4 * k[e] + b[e] - 1)
                    return !1;
                return g[e] >= g[r] ? g[e] <= A[r] + g[r] - 1 ? !0 : !1 : g[r] <= A[e] + g[e] - 1 ? !0 : !1
            }
            function z() {
                var e;
                for (e = 0; 16 > e; e++) {
                    var r = M[e];
                    H[r] && Pc.gputim(b[r], g[r], c[r], k[r], A[r])
                }
            }
            function E() {
                var e;
                for (e = 0; 16 > e; e++)
                    H[e] && Pc.gputi(b[e], g[e], w[e], k[e], A[e])
            }
            function P(e) {
                var r;
                if (!f[e])
                    for (f[e] = !0,
                             r = 0; 16 > r; r++)
                        F[r] && r != e && (p(r, e) && (H[r] = !0,
                            P(r)),
                            b[r] += 320,
                            g[r] -= 2,
                        p(r, e) && (H[r] = !0,
                            P(r)),
                            b[r] -= 640,
                            g[r] += 4,
                        p(r, e) && (H[r] = !0,
                            P(r)),
                            b[r] += 320,
                            g[r] -= 2)
            }
            var H = [!1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1]
                , f = [!1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1]
                , F = [!1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1, !1]
                , c = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , w = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
                , b = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , g = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , k = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , A = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , I = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , v = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , a = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , m = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , C = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , u = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                , N = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
                , M = N;
            return {
                bcollide: d,
                bcollides: n,
                clearrdrwf: x,
                clearrecf: q,
                collide: p,
                createspr: function(e, r, Q, R, V, U, O) {
                    a[e & 15] = c[e & 15] = r;
                    w[e & 15] = Q;
                    m[e & 15] = k[e & 15] = R;
                    C[e & 15] = A[e & 15] = V;
                    u[e & 15] = I[e & 15] = U;
                    y[e & 15] = v[e & 15] = O;
                    F[e & 15] = !1
                },
                drawmiscspr: function(e, r, Q, R, V) {
                    b[16] = e & -4;
                    g[16] = r;
                    c[16] = Q;
                    k[16] = R;
                    A[16] = V;
                    Pc.gputim(b[16], g[16], c[16], k[16], A[16])
                },
                drawspr: function(e, r, Q) {
                    e &= 15;
                    r &= -4;
                    x();
                    P(e);
                    var R = b[e];
                    var V = g[e];
                    var U = k[e];
                    var O = A[e];
                    b[e] = r;
                    g[e] = Q;
                    k[e] = m[e];
                    A[e] = C[e];
                    q();
                    P(e);
                    A[e] = O;
                    k[e] = U;
                    g[e] = V;
                    b[e] = R;
                    H[e] = !0;
                    E();
                    b[e] = r;
                    g[e] = Q;
                    c[e] = a[e];
                    k[e] = m[e];
                    A[e] = C[e];
                    I[e] = u[e];
                    v[e] = y[e];
                    Pc.ggeti(b[e], g[e], w[e], k[e], A[e]);
                    z();
                    return n(e)
                },
                erasespr: function(e) {
                    e &= 15;
                    Pc.gputi(b[e], g[e], w[e], k[e], A[e], !0);
                    F[e] = !1;
                    x();
                    P(e);
                    z()
                },
                getis: function() {
                    var e;
                    for (e = 0; 16 > e; e++)
                        H[e] && Pc.ggeti(b[e], g[e], w[e], k[e], A[e]);
                    z()
                },
                initmiscspr: function(e, r, Q, R) {
                    b[16] = e;
                    g[16] = r;
                    k[16] = Q;
                    A[16] = R;
                    x();
                    P(16);
                    E()
                },
                initspr: function(e, r, Q, R, V, U) {
                    a[e & 15] = r;
                    m[e & 15] = Q;
                    C[e & 15] = R;
                    u[e & 15] = V;
                    y[e & 15] = U
                },
                movedrawspr: function(e, r, Q) {
                    e &= 15;
                    b[e] = r & -4;
                    g[e] = Q;
                    c[e] = a[e];
                    k[e] = m[e];
                    A[e] = C[e];
                    I[e] = u[e];
                    v[e] = y[e];
                    x();
                    P(e);
                    E();
                    Pc.ggeti(b[e], g[e], w[e], k[e], A[e]);
                    F[e] = !0;
                    H[e] = !0;
                    z();
                    return n(e)
                },
                putims: z,
                putis: E,
                setrdrwflgs: P,
                setretr: function() {},
                setsprorder: function(e) {
                    M = null == e ? N : e
                }
            }
        }();
        var Ga, pb = [15, 255, 0, 63, 255, 192, 60, 3, 192, 60, 3, 192, 60, 3, 192, 63, 255, 192, 255, 255, 240, 252, 0, 240, 252, 0, 240, 252, 0, 240, 252, 0, 240, 252, 0, 240], qb = [63, 252, 0, 255, 255, 0, 240, 15, 0, 240, 15, 0, 240, 15, 0, 255, 255, 0, 255, 255, 240, 252, 0, 240, 252, 0, 240, 252, 0, 240, 255, 255, 240, 63, 255, 192], xb = [63, 255, 192, 255, 255, 240, 240, 0, 240, 240, 0, 240, 240, 0, 0, 252, 0, 0, 252, 0, 0, 252, 0, 0, 252, 0, 240, 252, 0, 240, 255, 255, 240, 63, 255, 192], yb = [255, 255, 192, 255, 255, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 255, 240, 255, 255, 192], zb = [63, 255, 240, 255, 255, 240, 240, 0, 0, 240, 0, 0, 240, 0, 0, 255, 255, 0, 255, 255, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 255, 240, 63, 255, 240], Ab = [63, 255, 240, 255, 255, 240, 252, 0, 0, 252, 0, 0, 252, 0, 0, 255, 255, 0, 255, 255, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0], Bb = [63, 255, 192, 255, 255, 240, 240, 0, 240, 240, 0, 240, 240, 0, 0, 240, 0, 0, 252, 15, 192, 255, 15, 240, 255, 0, 240, 255, 0, 240, 255, 255, 240, 63, 255, 192], Cb = [240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 255, 255, 240, 255, 255, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240], Db = [0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0], Eb = [0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 15, 0, 0, 15, 240, 0, 15, 240, 240, 15, 240, 240, 15, 240, 240, 15, 240, 255, 255, 240, 63, 255, 192], Fb = [240, 15, 0, 240, 15, 0, 240, 15, 0, 240, 15, 0, 240, 15, 0, 255, 255, 0, 255, 255, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240], Gb = [240, 0, 0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 255, 240, 63, 255, 240], Hb = [63, 255, 192, 255, 255, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 252, 240, 240, 252, 240, 240, 252, 240, 240, 252, 240, 240, 252, 240, 240, 252, 240, 240], Ib = [15, 255, 192, 63, 255, 240, 60, 0, 240, 60, 0, 240, 60, 0, 240, 60, 0, 240, 63, 0, 240, 63, 0, 240, 63, 0, 240, 63, 0, 240, 63, 0, 240, 63, 0, 240], Jb = [63, 255, 192, 255, 255, 240, 240, 15, 240, 240, 15, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 255, 255, 240, 63, 255, 192], Kb = [63, 255, 192, 255, 255, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 255, 255, 240, 255, 255, 192, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0], Lb = [63, 255, 192, 255, 255, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 63, 240, 240, 63, 240, 255, 255, 240, 63, 255, 192], Mb = [63, 252, 0, 255, 255, 0, 240, 15, 0, 240, 15, 0, 240, 15, 0, 255, 255, 0, 255, 255, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240], Nb = [63, 255, 192, 255, 255, 240, 240, 0, 240, 240, 0, 0, 240, 0, 0, 255, 255, 192, 63, 255, 240, 0, 15, 240, 0, 15, 240, 240, 15, 240, 255, 255, 240, 63, 255, 192], Ob = [255, 255, 240, 255, 255, 240, 0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0], Pb = [240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 255, 240, 63, 255, 192], Qb = [240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 60, 15, 0, 60, 15, 0, 63, 255, 0, 15, 252, 0], Rb = [240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 252, 240, 240, 252, 240, 240, 252, 240, 240, 252, 240, 240, 255, 255, 240, 63, 255, 192], Sb = [240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 15, 255, 0, 15, 255, 0, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240, 255, 0, 240], Tb = [240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 255, 255, 240, 63, 255, 192, 0, 252, 0, 0, 252, 0, 0, 252, 0, 0, 252, 0, 0, 252, 0], Ub = [63, 255, 192, 255, 255, 240, 240, 0, 240, 0, 0, 240, 0, 0, 240, 63, 255, 240, 255, 255, 192, 255, 0, 0, 255, 0, 0, 255, 0, 240, 255, 255, 240, 63, 255, 192];
        Ga = {
            ascii2cga: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], null, null, null, null, null, null, null, null, null, null, null, null, null, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 192, 0, 3, 192, 0], null, [63, 255, 192, 255, 255, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 240, 15, 240, 240, 15, 240, 240, 15, 240, 240, 15, 240, 240, 15, 240, 255, 255, 240, 63, 255, 192], [0, 60, 0, 0, 60, 0, 0, 60, 0, 0, 60, 0, 0, 60, 0, 0, 252, 0, 0, 252, 0, 0, 252, 0, 0, 252, 0, 0, 252, 0, 0, 252, 0, 0, 252, 0], [63, 255, 192, 255, 255, 240, 240, 0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 240, 63, 255, 240, 255, 255, 192, 255, 0, 0, 255, 0, 0, 255, 255, 240, 63, 255, 240], [63, 252, 0, 255, 255, 0, 240, 15, 0, 240, 15, 0, 0, 15, 0, 15, 255, 192, 15, 255, 240, 0, 3, 240, 240, 3, 240, 240, 3, 240, 255, 255, 240, 63, 255, 192], [240, 0, 0, 240, 0, 0, 240, 15, 0, 240, 15, 0, 240, 15, 0, 240, 15, 0, 240, 15, 0, 255, 255, 240, 63, 255, 240, 0, 63, 0, 0, 63, 0, 0, 63, 0], [63, 255, 0, 255, 255, 0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 255, 255, 192, 63, 255, 240, 0, 15, 240, 240, 15, 240, 240, 15, 240, 255, 255, 240, 63, 255, 192], [63, 255, 192, 255, 255, 240, 240, 0, 240, 240, 0, 240, 240, 0, 0, 255, 255, 192, 255, 255, 240, 240, 15, 240, 240, 15, 240, 240, 15, 240, 255, 255, 240, 63, 255, 192], [63, 255, 192, 63, 255, 240, 0, 0, 240, 0, 0, 240, 0, 0, 240, 0, 0, 240, 0, 3, 240, 0, 3, 240, 0, 3, 240, 0, 3, 240, 0, 3, 240, 0, 3, 240], [3, 255, 0, 15, 255, 192, 15, 3, 192, 15, 3, 192, 15, 3, 192, 15, 255, 192, 63, 255, 240, 240, 3, 240, 240, 3, 240, 240, 3, 240, 255, 255, 240, 63, 255, 192], [63, 255, 192, 255, 255, 240, 240, 0, 240, 240, 0, 240, 240, 0, 240, 255, 255, 240, 63, 255, 240, 0, 15, 240, 0, 15, 240, 0, 15, 240, 0, 15, 240, 0, 15, 240], null, null, null, null, null, null, null, pb, qb, xb, yb, zb, Ab, Bb, Cb, Db, Eb, Fb, Gb, Hb, Ib, Jb, Kb, Lb, Mb, Nb, Ob, Pb, Qb, Rb, Sb, Tb, Ub, null, null, null, null, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 255, 240], null, pb, qb, xb, yb, zb, Ab, Bb, Cb, Db, Eb, Fb, Gb, Hb, Ib, Jb, Kb, Lb, Mb, Nb, Ob, Pb, Qb, Rb, Sb, Tb, Ub, null, null, null, null]
        };
        var xa, Vb = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], Wb = [192, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 3], Xb = [0, 0, 0, 0, 0, 15, 0, 0, 0, 63, 192, 0, 0, 48, 192, 0, 0, 48, 192, 0, 0, 48, 192, 0, 2, 170, 161, 85, 10, 170, 165, 85, 42, 170, 165, 0, 130, 170, 165, 85, 60, 168, 33, 85, 195, 35, 192, 0, 195, 12, 48, 0, 60, 12, 48, 0, 0, 3, 192, 0], Yb = [255, 240, 255, 255, 255, 192, 63, 255, 255, 0, 15, 255, 255, 0, 15, 255, 255, 0, 15, 255, 252, 0, 12, 0, 240, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 3, 255, 0, 192, 3, 255, 195, 240, 15, 255], Zb = [0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 63, 192, 0, 0, 48, 192, 0, 0, 48, 192, 84, 2, 170, 165, 84, 10, 170, 165, 64, 42, 170, 165, 0, 170, 168, 37, 64, 130, 163, 197, 84, 60, 140, 48, 84, 195, 12, 48, 0, 195, 3, 192, 0, 60, 0, 0, 0], $b = [255, 255, 255, 255, 255, 240, 255, 255, 255, 192, 63, 255, 255, 0, 15, 255, 255, 0, 15, 3, 252, 0, 0, 0, 240, 0, 0, 0, 192, 0, 0, 3, 0, 0, 0, 63, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 48, 15, 255, 0, 252, 63, 255], ac = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 63, 192, 80, 0, 48, 193, 80, 2, 170, 165, 64, 10, 170, 165, 0, 42, 170, 165, 0, 130, 170, 165, 0, 60, 168, 37, 64, 195, 35, 193, 80, 195, 12, 48, 80, 60, 12, 48, 0, 0, 3, 192, 0], bc = [255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 255, 255, 255, 192, 63, 15, 255, 0, 12, 3, 252, 0, 0, 3, 240, 0, 0, 15, 192, 0, 0, 63, 0, 0, 0, 63, 0, 0, 0, 63, 0, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 3, 0, 192, 3, 15, 195, 240, 15, 255], cc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 63, 192, 0, 2, 170, 161, 85, 10, 170, 165, 85, 42, 170, 165, 0, 130, 170, 165, 85, 60, 168, 33, 85, 195, 35, 192, 0, 195, 12, 48, 0, 60, 12, 48, 0, 0, 3, 192, 0], dc = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 255, 255, 255, 192, 63, 255, 252, 0, 12, 0, 240, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 3, 255, 0, 192, 3, 255, 195, 240, 15, 255], ec = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 63, 192, 84, 2, 170, 165, 84, 10, 170, 165, 64, 42, 170, 165, 0, 170, 168, 37, 64, 130, 163, 197, 84, 60, 140, 48, 84, 195, 12, 48, 0, 195, 3, 192, 0, 60, 0, 0, 0], fc = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 255, 255, 255, 192, 63, 3, 252, 0, 0, 0, 240, 0, 0, 0, 192, 0, 0, 3, 0, 0, 0, 63, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 48, 15, 255, 0, 252, 63, 255], gc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 80, 0, 63, 193, 80, 2, 170, 165, 64, 10, 170, 165, 0, 42, 170, 165, 0, 130, 170, 165, 0, 60, 168, 37, 64, 195, 35, 193, 80, 195, 12, 48, 80, 60, 12, 48, 0, 0, 3, 192, 0], hc = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 255, 15, 255, 192, 60, 3, 252, 0, 0, 3, 240, 0, 0, 15, 192, 0, 0, 63, 0, 0, 0, 63, 0, 0, 0, 63, 0, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 3, 0, 192, 3, 15, 195, 240, 15, 255], ic = [0, 81, 64, 0, 0, 81, 64, 0, 0, 81, 64, 0, 0, 81, 64, 0, 0, 21, 0, 0, 60, 170, 128, 0, 195, 42, 191, 192, 195, 42, 128, 240, 60, 170, 128, 240, 0, 170, 191, 192, 0, 170, 128, 0, 15, 42, 128, 0, 48, 202, 0, 0, 48, 200, 0, 0, 15, 32, 0, 0], jc = [252, 0, 15, 255, 252, 0, 15, 255, 252, 0, 15, 255, 252, 0, 15, 255, 195, 0, 63, 255, 0, 0, 0, 63, 0, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 3, 192, 0, 0, 15, 240, 0, 0, 63, 192, 0, 15, 255, 0, 0, 63, 255, 0, 0, 255, 255, 192, 3, 255, 255], kc = [1, 64, 80, 0, 1, 64, 80, 0, 1, 81, 80, 0, 1, 85, 80, 0, 0, 85, 64, 0, 15, 42, 128, 0, 48, 202, 191, 0, 48, 202, 131, 192, 15, 42, 131, 192, 0, 42, 191, 0, 0, 170, 128, 0, 60, 170, 128, 0, 195, 42, 0, 0, 195, 40, 0, 0, 60, 160, 0, 0], lc = [240, 12, 3, 255, 240, 12, 3, 255, 240, 0, 3, 255, 240, 0, 3, 255, 240, 0, 15, 255, 192, 0, 0, 255, 0, 0, 0, 63, 0, 0, 0, 15, 192, 0, 0, 15, 240, 0, 0, 63, 192, 0, 0, 255, 0, 0, 15, 255, 0, 0, 63, 255, 0, 3, 255, 255, 0, 15, 255, 255], mc = [0, 0, 0, 0, 5, 0, 20, 0, 5, 64, 84, 0, 1, 85, 80, 0, 0, 85, 64, 0, 60, 170, 128, 0, 195, 42, 188, 0, 195, 42, 143, 0, 60, 170, 143, 0, 0, 170, 188, 0, 0, 170, 128, 0, 15, 42, 128, 0, 48, 202, 0, 0, 48, 200, 0, 0, 15, 32, 0, 0], nc = [240, 255, 195, 255, 192, 63, 0, 255, 192, 0, 0, 255, 240, 0, 3, 255, 192, 0, 15, 255, 0, 0, 3, 255, 0, 0, 0, 255, 0, 0, 0, 63, 0, 0, 0, 63, 192, 0, 0, 255, 240, 0, 3, 255, 192, 0, 15, 255, 0, 0, 63, 255, 0, 0, 255, 255, 192, 3, 255, 255], oc = [0, 81, 64, 0, 0, 81, 64, 0, 0, 81, 64, 0, 0, 81, 64, 0, 0, 21, 0, 0, 60, 170, 128, 0, 195, 42, 176, 0, 195, 42, 188, 0, 60, 170, 188, 0, 0, 170, 176, 0, 0, 170, 128, 0, 15, 42, 128, 0, 48, 202, 0, 0, 48, 200, 0, 0, 15, 32, 0, 0], pc = [252, 0, 15, 255, 252, 0, 15, 255, 252, 0, 15, 255, 252, 0, 15, 255, 195, 0, 63, 255, 0, 0, 15, 255, 0, 0, 3, 255, 0, 0, 0, 255, 0, 0, 0, 255, 192, 0, 3, 255, 240, 0, 15, 255, 192, 0, 15, 255, 0, 0, 63, 255, 0, 0, 255, 255, 192, 3, 255, 255], qc = [1, 64, 80, 0, 1, 64, 80, 0, 1, 81, 80, 0, 1, 85, 80, 0, 0, 85, 64, 0, 15, 42, 128, 0, 48, 202, 176, 0, 48, 202, 188, 0, 15, 42, 188, 0, 0, 42, 176, 0, 0, 170, 128, 0, 60, 170, 128, 0, 195, 42, 0, 0, 195, 40, 0, 0, 60, 160, 0, 0], rc = [240, 12, 3, 255, 240, 12, 3, 255, 240, 0, 3, 255, 240, 0, 3, 255, 240, 0, 15, 255, 192, 0, 15, 255, 0, 0, 3, 255, 0, 0, 0, 255, 192, 0, 0, 255, 240, 0, 3, 255, 192, 0, 15, 255, 0, 0, 15, 255, 0, 0, 63, 255, 0, 0, 255, 255, 0, 3, 255, 255], sc = [0, 0, 0, 0, 5, 0, 20, 0, 5, 64, 84, 0, 1, 85, 80, 0, 0, 85, 64, 0, 60, 170, 128, 0, 195, 42, 176, 0, 195, 42, 188, 0, 60, 170, 188, 0, 0, 170, 176, 0, 0, 170, 128, 0, 15, 42, 128, 0, 48, 202, 0, 0, 48, 200, 0, 0, 15, 32, 0, 0], tc = [240, 255, 195, 255, 192, 63, 0, 255, 192, 0, 0, 255, 240, 0, 3, 255, 192, 0, 15, 255, 0, 0, 15, 255, 0, 0, 3, 255, 0, 0, 0, 255, 0, 0, 0, 255, 192, 0, 3, 255, 240, 0, 15, 255, 192, 0, 15, 255, 0, 0, 63, 255, 0, 0, 255, 255, 192, 3, 255, 255], uc = [0, 0, 0, 0, 0, 0, 240, 0, 0, 3, 252, 0, 0, 3, 12, 0, 0, 3, 12, 0, 0, 3, 12, 0, 85, 74, 170, 128, 85, 90, 170, 160, 0, 90, 170, 168, 85, 90, 170, 130, 85, 72, 42, 60, 0, 3, 200, 195, 0, 12, 48, 195, 0, 12, 48, 60, 0, 3, 192, 0], vc = [255, 255, 15, 255, 255, 252, 3, 255, 255, 240, 0, 255, 255, 240, 0, 255, 255, 240, 0, 255, 0, 48, 0, 63, 0, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 255, 192, 0, 0, 255, 192, 3, 0, 255, 240, 15, 195], wc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 240, 0, 0, 3, 252, 0, 0, 3, 12, 0, 21, 67, 12, 0, 21, 90, 170, 128, 1, 90, 170, 160, 0, 90, 170, 168, 1, 88, 42, 170, 21, 83, 194, 130, 21, 76, 48, 60, 0, 12, 48, 195, 0, 3, 192, 195, 0, 0, 0, 60], xc = [255, 255, 255, 255, 255, 255, 15, 255, 255, 252, 3, 255, 255, 240, 0, 255, 192, 48, 0, 255, 0, 0, 0, 63, 0, 0, 0, 15, 192, 0, 0, 3, 252, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 0, 255, 240, 12, 0, 255, 252, 63, 0], yc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 240, 0, 5, 3, 252, 0, 5, 67, 12, 0, 1, 90, 170, 128, 0, 90, 170, 160, 0, 90, 170, 168, 0, 90, 170, 130, 1, 88, 42, 60, 5, 67, 200, 195, 5, 12, 48, 195, 0, 12, 48, 60, 0, 3, 192, 0], zc = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 15, 255, 240, 252, 3, 255, 192, 48, 0, 255, 192, 0, 0, 63, 240, 0, 0, 15, 252, 0, 0, 3, 252, 0, 0, 0, 252, 0, 0, 0, 240, 0, 0, 0, 192, 0, 0, 0, 192, 0, 0, 0, 240, 192, 3, 0, 255, 240, 15, 195], Ac = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 240, 0, 0, 3, 252, 0, 85, 74, 170, 128, 85, 90, 170, 160, 0, 90, 170, 168, 85, 90, 170, 130, 85, 72, 42, 60, 0, 3, 200, 195, 0, 12, 48, 195, 0, 12, 48, 60, 0, 3, 192, 0], Bc = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 15, 255, 255, 252, 3, 255, 0, 48, 0, 63, 0, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 255, 192, 0, 0, 255, 192, 3, 0, 255, 240, 15, 195], Cc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 240, 0, 21, 67, 252, 0, 21, 90, 170, 128, 1, 90, 170, 160, 0, 90, 170, 168, 1, 88, 42, 170, 21, 83, 194, 130, 21, 76, 48, 60, 0, 12, 48, 195, 0, 3, 192, 195, 0, 0, 0, 60], Dc = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 15, 255, 192, 60, 3, 255, 0, 0, 0, 63, 0, 0, 0, 15, 192, 0, 0, 3, 252, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 0, 255, 240, 12, 0, 255, 252, 63, 0], Ec = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 240, 0, 5, 67, 252, 0, 1, 90, 170, 128, 0, 90, 170, 160, 0, 90, 170, 168, 0, 90, 170, 130, 1, 88, 42, 60, 5, 67, 200, 195, 5, 12, 48, 195, 0, 12, 48, 60, 0, 3, 192, 0], Fc = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 255, 15, 255, 192, 60, 3, 255, 192, 0, 0, 63, 240, 0, 0, 15, 252, 0, 0, 3, 252, 0, 0, 0, 252, 0, 0, 0, 240, 0, 0, 0, 192, 0, 0, 0, 192, 0, 0, 0, 240, 192, 3, 0, 255, 240, 15, 195], Gc = [0, 0, 8, 240, 0, 0, 35, 12, 0, 0, 163, 12, 0, 2, 168, 240, 0, 2, 170, 0, 3, 254, 170, 0, 15, 2, 170, 60, 15, 2, 168, 195, 3, 254, 168, 195, 0, 2, 170, 60, 0, 0, 84, 0, 0, 1, 85, 0, 0, 1, 69, 0, 0, 1, 69, 0, 0, 1, 69, 0], Hc = [255, 255, 192, 3, 255, 255, 0, 0, 255, 252, 0, 0, 255, 240, 0, 3, 252, 0, 0, 15, 240, 0, 0, 3, 192, 0, 0, 0, 192, 0, 0, 0, 240, 0, 0, 0, 252, 0, 0, 0, 255, 252, 0, 195, 255, 240, 0, 63, 255, 240, 0, 63, 255, 240, 0, 63, 255, 240, 0, 63], Ic = [0, 0, 10, 60, 0, 0, 40, 195, 0, 0, 168, 195, 0, 2, 170, 60, 0, 2, 170, 0, 0, 254, 168, 0, 3, 194, 168, 240, 3, 194, 163, 12, 0, 254, 163, 12, 0, 2, 168, 240, 0, 1, 84, 0, 0, 5, 69, 64, 0, 5, 1, 64, 0, 5, 1, 64, 0, 5, 1, 64], Jc = [255, 255, 192, 0, 255, 255, 0, 0, 255, 252, 0, 0, 255, 240, 0, 0, 255, 0, 0, 3, 252, 0, 0, 15, 240, 0, 0, 3, 240, 0, 0, 0, 252, 0, 0, 0, 255, 0, 0, 3, 255, 240, 0, 15, 255, 192, 0, 15, 255, 192, 48, 15, 255, 192, 48, 15, 255, 192, 48, 15], Kc = [0, 0, 8, 240, 0, 0, 35, 12, 0, 0, 163, 12, 0, 2, 168, 240, 0, 2, 170, 0, 0, 62, 170, 0, 0, 242, 170, 60, 0, 242, 168, 195, 0, 62, 168, 195, 0, 2, 170, 60, 0, 1, 85, 0, 0, 5, 85, 64, 0, 21, 1, 80, 0, 20, 0, 80, 0, 0, 0, 0], Lc = [255, 255, 192, 3, 255, 255, 0, 0, 255, 252, 0, 0, 255, 240, 0, 3, 255, 192, 0, 15, 255, 0, 0, 3, 252, 0, 0, 0, 252, 0, 0, 0, 255, 0, 0, 0, 255, 192, 0, 0, 255, 240, 0, 3, 255, 192, 0, 15, 255, 0, 0, 3, 255, 0, 252, 3, 255, 195, 255, 15], Mc = [0, 0, 8, 240, 0, 0, 35, 12, 0, 0, 163, 12, 0, 2, 168, 240, 0, 2, 170, 0, 0, 14, 170, 0, 0, 62, 170, 60, 0, 62, 168, 195, 0, 14, 168, 195, 0, 2, 170, 60, 0, 0, 84, 0, 0, 1, 85, 0, 0, 1, 69, 0, 0, 1, 69, 0, 0, 1, 69, 0], Nc = [255, 255, 192, 3, 255, 255, 0, 0, 255, 252, 0, 0, 255, 240, 0, 3, 255, 240, 0, 15, 255, 192, 0, 3, 255, 0, 0, 0, 255, 0, 0, 0, 255, 192, 0, 0, 255, 240, 0, 0, 255, 252, 0, 195, 255, 240, 0, 63, 255, 240, 0, 63, 255, 240, 0, 63, 255, 240, 0, 63], Oc = [0, 0, 10, 60, 0, 0, 40, 195, 0, 0, 168, 195, 0, 2, 170, 60, 0, 2, 170, 0, 0, 14, 168, 0, 0, 62, 168, 240, 0, 62, 163, 12, 0, 14, 163, 12, 0, 2, 168, 240, 0, 1, 84, 0, 0, 5, 69, 64, 0, 5, 1, 64, 0, 5, 1, 64, 0, 5, 1, 64], Qc = [255, 255, 192, 0, 255, 255, 0, 0, 255, 252, 0, 0, 255, 240, 0, 0, 255, 240, 0, 3, 255, 192, 0, 15, 255, 0, 0, 3, 255, 0, 0, 0, 255, 192, 0, 0, 255, 240, 0, 3, 255, 240, 0, 15, 255, 192, 0, 15, 255, 192, 48, 15, 255, 192, 48, 15, 255, 192, 48, 15], Rc = [0, 0, 8, 240, 0, 0, 35, 12, 0, 0, 163, 12, 0, 2, 168, 240, 0, 2, 170, 0, 0, 14, 170, 0, 0, 62, 170, 60, 0, 62, 168, 195, 0, 14, 168, 195, 0, 2, 170, 60, 0, 1, 85, 0, 0, 5, 85, 64, 0, 21, 1, 80, 0, 20, 0, 80, 0, 0, 0, 0], Sc = [255, 255, 192, 3, 255, 255, 0, 0, 255, 252, 0, 0, 255, 240, 0, 3, 255, 240, 0, 15, 255, 192, 0, 3, 255, 0, 0, 0, 255, 0, 0, 0, 255, 192, 0, 0, 255, 240, 0, 0, 255, 240, 0, 3, 255, 192, 0, 15, 255, 0, 0, 3, 255, 0, 252, 3, 255, 195, 255, 15], Tc = [0, 0, 0, 0, 0, 3, 192, 60, 0, 15, 48, 255, 0, 15, 240, 243, 5, 67, 202, 60, 85, 88, 42, 130, 80, 90, 170, 168, 5, 90, 170, 160, 85, 74, 170, 128, 80, 3, 15, 0, 0, 0, 204, 0, 0, 3, 15, 0, 0, 0, 255, 0, 0, 0, 60, 0, 0, 0, 0, 0], Uc = [255, 252, 63, 195, 255, 240, 15, 0, 255, 192, 0, 0, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 15, 0, 48, 0, 63, 15, 240, 0, 63, 255, 240, 0, 63, 255, 252, 0, 63, 255, 255, 0, 255, 255, 255, 195, 255], Vc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 64, 0, 0, 95, 212, 0, 5, 255, 253, 64, 7, 255, 255, 64, 0, 0, 0, 0], Wc = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 63, 255, 255, 0, 3, 255, 240, 0, 0, 63, 192, 0, 0, 15, 192, 0, 0, 15, 0, 0, 0, 3], Xc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 64, 0, 0, 95, 212, 0, 5, 255, 253, 64, 7, 255, 255, 64, 16, 15, 255, 208, 19, 204, 255, 208, 0, 0, 0, 0], Yc = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 63, 255, 255, 0, 3, 255, 240, 0, 0, 63, 192, 0, 0, 15, 192, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3], Zc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 64, 0, 0, 95, 212, 0, 5, 255, 253, 64, 7, 255, 255, 64, 16, 15, 255, 208, 19, 204, 255, 208, 16, 12, 192, 16, 16, 252, 207, 16, 0, 0, 0, 0], $c = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 63, 255, 255, 0, 3, 255, 240, 0, 0, 63, 192, 0, 0, 15, 192, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3], ad = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 64, 0, 0, 95, 212, 0, 5, 255, 253, 64, 7, 255, 255, 64, 16, 15, 255, 208, 19, 204, 255, 208, 16, 12, 192, 16, 16, 252, 207, 16, 19, 60, 192, 16, 19, 204, 207, 208, 31, 252, 207, 208, 0, 0, 0, 0], bd = [255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 63, 255, 255, 0, 3, 255, 240, 0, 0, 63, 192, 0, 0, 15, 192, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3], cd = [0, 0, 0, 0, 0, 5, 64, 0, 0, 95, 212, 0, 5, 255, 253, 64, 7, 255, 255, 64, 16, 15, 255, 208, 19, 204, 255, 208, 16, 12, 192, 16, 16, 252, 207, 16, 19, 60, 192, 16, 19, 204, 207, 208, 31, 252, 207, 208, 31, 255, 207, 208, 31, 255, 255, 208, 31, 255, 255, 208], dd = [255, 240, 63, 255, 255, 0, 3, 255, 240, 0, 0, 63, 192, 0, 0, 15, 192, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3], ed = [3, 192, 44, 190, 59, 204, 243, 251, 60, 252, 51, 204, 51, 176], fd = [192, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 3], gd = [11, 136, 60, 174, 10, 200, 243, 186, 172, 142, 163, 162, 35, 136], hd = [192, 51, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 204, 3], id = [10, 40, 35, 162, 138, 138, 179, 168, 42, 186, 163, 163, 10, 136], jd = [192, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 3], kd = [0, 0, 48, 12, 14, 176, 2, 128, 14, 176, 48, 12, 0, 0], ld = [15, 240, 0, 0, 192, 3, 240, 15, 192, 3, 0, 0, 15, 240], md = [192, 3, 48, 12, 8, 32, 0, 0, 8, 32, 48, 12, 192, 3], nd = [15, 240, 3, 192, 195, 195, 243, 207, 195, 195, 3, 192, 15, 240], od = [128, 2, 48, 12, 0, 0, 0, 0, 0, 0, 48, 12, 128, 2], pd = [15, 240, 3, 192, 207, 243, 255, 255, 207, 243, 3, 192, 15, 240], qd = [255, 192, 0, 15, 255, 0, 0, 3, 252, 0, 0, 0, 240, 0, 0, 0, 252, 0, 0, 0, 255, 0, 0, 3, 255, 192, 0, 15, 255, 240, 0, 63, 255, 252, 0, 255, 255, 255, 3, 255];
        xa = {
            cgatable: [Vb, Wb, Xb, Yb, Zb, $b, ac, bc, cc, dc, ec, fc, gc, hc, ic, jc, kc, lc, mc, nc, oc, pc, qc, rc, sc, tc, uc, vc, wc, xc, yc, zc, Ac, Bc, Cc, Dc, Ec, Fc, Gc, Hc, Ic, Jc, Kc, Lc, Mc, Nc, Oc, Qc, Rc, Sc, Tc, Uc, Vc, Wc, Xc, Yc, Zc, $c, ad, bd, cd, dd, Vb, Wb, Xb, Yb, Zb, $b, ac, bc, cc, dc, ec, fc, gc, hc, ic, jc, kc, lc, mc, nc, oc, pc, qc, rc, sc, tc, uc, vc, wc, xc, yc, zc, Ac, Bc, Cc, Dc, Ec, Fc, Gc, Hc, Ic, Jc, Kc, Lc, Mc, Nc, Oc, Qc, Rc, Sc, Tc, Uc, Vc, Wc, Xc, Yc, Zc, $c, ad, bd, cd, dd, [0, 0, 0, 0, 0, 15, 240, 0, 0, 3, 192, 0, 0, 15, 240, 0, 0, 255, 255, 0, 3, 252, 63, 192, 15, 0, 0, 240, 60, 60, 63, 252, 60, 0, 0, 60, 63, 252, 60, 60, 60, 60, 60, 60, 63, 0, 0, 252, 15, 252, 63, 240, 0, 255, 255, 0, 0, 0, 0, 0], [255, 192, 3, 255, 255, 192, 3, 255, 255, 240, 15, 255, 255, 0, 0, 255, 252, 0, 0, 63, 240, 0, 0, 15, 192, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 3, 240, 0, 0, 15, 255, 0, 0, 255], [0, 0, 0, 0, 0, 3, 252, 0, 0, 0, 240, 0, 0, 15, 252, 0, 0, 63, 255, 0, 0, 255, 15, 192, 3, 192, 0, 48, 15, 15, 15, 252, 15, 0, 0, 12, 15, 255, 15, 12, 15, 15, 15, 12, 3, 192, 0, 48, 0, 255, 15, 192, 0, 15, 252, 0, 0, 0, 0, 0], [255, 252, 3, 255, 255, 240, 0, 255, 255, 240, 3, 255, 255, 192, 0, 255, 255, 0, 0, 63, 252, 0, 0, 15, 240, 0, 0, 3, 192, 0, 0, 0, 192, 0, 0, 0, 192, 0, 0, 0, 192, 0, 0, 0, 240, 0, 0, 3, 252, 0, 0, 15, 255, 0, 0, 63, 255, 240, 3, 255], [0, 0, 0, 0, 0, 63, 192, 0, 0, 15, 0, 0, 0, 63, 192, 0, 0, 255, 252, 0, 3, 240, 255, 0, 12, 0, 3, 192, 48, 240, 255, 240, 48, 0, 0, 240, 63, 240, 240, 240, 48, 240, 240, 240, 60, 0, 3, 192, 15, 240, 255, 0, 0, 255, 240, 0, 0, 0, 0, 0], [255, 192, 63, 255, 255, 0, 15, 255, 255, 192, 63, 255, 255, 0, 3, 255, 252, 0, 0, 255, 240, 0, 0, 63, 192, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 15, 192, 0, 0, 63, 240, 0, 0, 255, 255, 0, 15, 255], [0, 12, 48, 0, 0, 3, 192, 0, 0, 3, 192, 0, 0, 15, 240, 0, 0, 63, 252, 0, 0, 252, 63, 0, 3, 0, 0, 192, 12, 60, 63, 240, 12, 0, 0, 48, 15, 252, 60, 48, 12, 60, 60, 48, 3, 0, 0, 192, 0, 252, 63, 0, 0, 63, 252, 0, 0, 3, 192, 0], [255, 192, 3, 255, 255, 240, 15, 255, 255, 240, 15, 255, 255, 192, 3, 255, 255, 0, 0, 255, 252, 0, 0, 63, 240, 0, 0, 15, 192, 0, 0, 3, 192, 0, 0, 3, 192, 0, 0, 3, 192, 0, 0, 3, 240, 0, 0, 15, 252, 0, 0, 63, 255, 0, 0, 255, 255, 192, 3, 255], [0, 0, 0, 0, 0, 3, 192, 0, 0, 15, 240, 0, 0, 243, 240, 0, 3, 252, 204, 0, 15, 255, 63, 0, 15, 255, 63, 192, 3, 252, 255, 192, 0, 240, 255, 0, 3, 15, 0, 0, 15, 243, 60, 0, 63, 252, 255, 0, 63, 252, 255, 192, 15, 243, 255, 192, 3, 204, 255, 0], [255, 252, 63, 255, 255, 240, 15, 255, 255, 0, 3, 255, 252, 0, 3, 255, 240, 0, 0, 255, 192, 0, 0, 63, 192, 0, 0, 15, 240, 0, 0, 15, 252, 0, 0, 63, 240, 0, 0, 255, 192, 0, 0, 255, 192, 0, 0, 63, 0, 0, 0, 15, 192, 0, 0, 15, 240, 0, 0, 63], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 240, 63, 192, 3, 252, 255, 240, 15, 255, 63, 240, 15, 255, 15, 192, 3, 252, 243, 0, 0, 243, 252, 0, 15, 15, 243, 0, 63, 195, 207, 192, 63, 240, 63, 240, 15, 243, 63, 240, 3, 207, 207, 192], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 240, 255, 255, 15, 192, 63, 252, 3, 0, 15, 240, 0, 0, 3, 192, 0, 0, 3, 192, 0, 0, 15, 240, 0, 0, 63, 240, 0, 0, 255, 192, 0, 0, 63, 192, 0, 0, 15, 0, 0, 0, 3, 192, 0, 0, 3, 240, 0, 0, 15], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 192, 3, 192, 15, 243, 207, 240, 63, 252, 243, 252, 63, 252, 252, 252, 15, 240, 252, 0, 3, 195, 243, 240, 60, 48, 15, 252, 63, 243, 207, 252, 15, 207, 243, 240], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 252, 63, 252, 63, 240, 12, 0, 15, 192, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 3, 192, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 3], [0, 0, 0, 0, 3, 240, 15, 192, 15, 253, 127, 240, 12, 61, 112, 240, 12, 61, 112, 240, 3, 245, 95, 192, 0, 85, 85, 0, 0, 21, 84, 0, 2, 132, 18, 128, 10, 5, 80, 160, 10, 1, 64, 160, 10, 0, 2, 168, 10, 0, 10, 170, 42, 128, 0, 0, 170, 160, 0, 0], [252, 15, 240, 63, 240, 0, 0, 15, 192, 0, 0, 3, 192, 0, 0, 3, 192, 0, 0, 3, 240, 0, 0, 15, 252, 0, 0, 63, 252, 0, 0, 63, 240, 0, 0, 15, 192, 0, 0, 3, 192, 48, 12, 3, 192, 60, 48, 0, 192, 63, 192, 0, 0, 15, 240, 0, 0, 3, 255, 255], [0, 0, 0, 0, 3, 240, 15, 192, 15, 253, 127, 240, 15, 13, 124, 48, 15, 13, 124, 48, 3, 245, 95, 192, 0, 85, 85, 0, 0, 20, 20, 0, 2, 132, 18, 128, 10, 5, 80, 160, 10, 1, 64, 160, 10, 0, 0, 160, 42, 128, 2, 168, 170, 160, 10, 170, 0, 0, 0, 0], [252, 15, 240, 63, 240, 0, 0, 15, 192, 0, 0, 3, 192, 0, 0, 3, 192, 0, 0, 3, 240, 0, 0, 15, 252, 0, 0, 63, 252, 0, 0, 63, 240, 0, 0, 15, 192, 0, 0, 3, 192, 48, 12, 3, 192, 60, 60, 3, 0, 63, 240, 0, 0, 15, 192, 0, 0, 15, 240, 0], [0, 0, 0, 0, 3, 240, 15, 192, 15, 13, 124, 48, 15, 13, 124, 48, 15, 253, 127, 240, 3, 245, 95, 192, 0, 84, 21, 0, 0, 20, 20, 0, 2, 132, 18, 128, 10, 4, 16, 160, 10, 1, 64, 160, 42, 128, 0, 160, 170, 160, 0, 160, 0, 0, 2, 168, 0, 0, 10, 170], [252, 15, 240, 63, 240, 0, 0, 15, 192, 0, 0, 3, 192, 0, 0, 3, 192, 0, 0, 3, 240, 0, 0, 15, 252, 0, 0, 63, 252, 0, 0, 63, 240, 0, 0, 15, 192, 0, 0, 3, 192, 48, 12, 3, 0, 12, 60, 3, 0, 3, 252, 3, 0, 15, 240, 0, 255, 255, 192, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 240, 15, 192, 12, 61, 124, 48, 12, 61, 124, 48, 15, 253, 127, 240, 3, 245, 95, 192, 0, 84, 21, 0, 0, 20, 20, 0, 2, 132, 18, 128, 10, 4, 16, 160, 42, 129, 66, 168, 170, 160, 10, 170, 0, 0, 0, 0], [255, 255, 255, 255, 255, 255, 255, 255, 252, 15, 240, 63, 240, 0, 0, 15, 192, 0, 0, 3, 192, 0, 0, 3, 192, 0, 0, 3, 240, 0, 0, 15, 252, 0, 0, 63, 252, 0, 0, 63, 240, 0, 0, 15, 192, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 240, 0], [0, 79, 196, 0, 1, 63, 241, 0, 5, 48, 241, 0, 21, 48, 241, 64, 21, 79, 197, 80, 21, 80, 21, 84, 5, 85, 106, 160, 1, 85, 128, 0, 0, 85, 106, 160, 0, 21, 85, 64, 0, 2, 128, 0, 0, 2, 128, 0, 0, 2, 128, 0, 0, 10, 160, 0, 0, 42, 168, 0], [252, 0, 0, 255, 240, 0, 0, 63, 192, 0, 0, 63, 0, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 0, 192, 0, 0, 3, 240, 0, 0, 15, 252, 0, 0, 3, 255, 0, 0, 15, 255, 192, 0, 63, 255, 240, 15, 255, 255, 240, 15, 255, 255, 192, 3, 255, 255, 0, 0, 255], [0, 79, 196, 0, 1, 63, 241, 0, 5, 60, 49, 64, 21, 60, 49, 80, 21, 79, 197, 84, 21, 80, 21, 168, 5, 85, 106, 0, 1, 85, 128, 0, 0, 85, 104, 0, 0, 21, 86, 160, 0, 2, 129, 80, 0, 2, 128, 0, 0, 10, 160, 0, 0, 42, 168, 0, 0, 0, 0, 0], [252, 0, 0, 255, 240, 0, 0, 63, 192, 0, 0, 63, 0, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 3, 192, 0, 0, 15, 240, 0, 0, 255, 252, 0, 0, 15, 255, 0, 0, 3, 255, 192, 0, 15, 255, 240, 12, 63, 255, 192, 3, 255, 255, 0, 0, 255, 255, 192, 3, 255], [0, 79, 196, 0, 1, 60, 49, 0, 5, 60, 49, 64, 21, 63, 241, 80, 21, 79, 197, 104, 21, 80, 22, 128, 5, 85, 104, 0, 1, 85, 128, 0, 0, 85, 104, 0, 0, 21, 86, 128, 0, 2, 129, 96, 0, 10, 160, 0, 0, 42, 168, 0, 0, 0, 0, 0, 0, 0, 0, 0], [252, 0, 0, 255, 240, 0, 0, 63, 192, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 192, 0, 0, 63, 240, 0, 3, 255, 252, 0, 0, 63, 255, 0, 0, 3, 255, 192, 0, 3, 255, 192, 0, 15, 255, 0, 0, 255, 255, 192, 3, 255, 255, 255, 255, 255], [0, 0, 0, 0, 0, 0, 0, 0, 0, 79, 196, 0, 1, 60, 49, 0, 5, 60, 49, 64, 21, 63, 241, 80, 21, 79, 197, 104, 21, 80, 22, 128, 5, 85, 104, 0, 1, 85, 168, 0, 0, 85, 90, 128, 0, 21, 85, 168, 0, 10, 160, 0, 0, 42, 168, 0, 0, 0, 0, 0], [255, 255, 255, 255, 255, 0, 3, 255, 252, 0, 0, 255, 240, 0, 0, 63, 192, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 192, 0, 0, 63, 240, 0, 3, 255, 252, 0, 0, 63, 255, 0, 0, 3, 255, 192, 0, 3, 255, 0, 0, 255, 255, 192, 3, 255], [0, 19, 241, 0, 0, 79, 252, 64, 0, 79, 12, 80, 1, 79, 12, 84, 5, 83, 241, 84, 21, 84, 5, 84, 10, 169, 85, 80, 0, 2, 85, 64, 10, 169, 85, 0, 1, 85, 84, 0, 0, 2, 128, 0, 0, 2, 128, 0, 0, 2, 128, 0, 0, 10, 160, 0, 0, 42, 168, 0], [255, 0, 0, 63, 252, 0, 0, 15, 252, 0, 0, 3, 240, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 3, 240, 0, 0, 15, 192, 0, 0, 63, 240, 0, 0, 255, 252, 0, 3, 255, 255, 240, 15, 255, 255, 240, 15, 255, 255, 192, 3, 255, 255, 0, 0, 255], [0, 19, 241, 0, 0, 79, 252, 64, 1, 76, 60, 80, 5, 76, 60, 84, 21, 83, 241, 84, 42, 84, 5, 84, 0, 169, 85, 80, 0, 2, 85, 64, 0, 41, 85, 0, 10, 149, 84, 0, 5, 66, 128, 0, 0, 2, 128, 0, 0, 10, 160, 0, 0, 42, 168, 0, 0, 0, 0, 0], [255, 0, 0, 63, 252, 0, 0, 15, 240, 0, 0, 3, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 3, 255, 0, 0, 15, 240, 0, 0, 63, 192, 0, 0, 255, 240, 0, 3, 255, 252, 48, 15, 255, 255, 192, 3, 255, 255, 0, 0, 255, 255, 192, 3, 255], [0, 19, 241, 0, 0, 76, 60, 64, 1, 76, 60, 80, 5, 79, 252, 84, 41, 83, 241, 84, 2, 148, 5, 84, 0, 41, 85, 80, 0, 2, 85, 64, 0, 41, 85, 0, 2, 149, 84, 0, 9, 66, 128, 0, 0, 10, 160, 0, 0, 42, 168, 0, 0, 0, 0, 0, 0, 0, 0, 0], [255, 0, 0, 63, 252, 0, 0, 15, 240, 0, 0, 3, 192, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 0, 252, 0, 0, 3, 255, 0, 0, 15, 240, 0, 0, 63, 240, 0, 0, 255, 240, 0, 3, 255, 252, 0, 3, 255, 255, 0, 0, 255, 255, 192, 3, 255, 255, 255, 255, 255], [0, 0, 0, 0, 0, 19, 241, 0, 0, 76, 60, 64, 1, 76, 60, 80, 5, 79, 252, 84, 41, 83, 241, 84, 2, 148, 5, 84, 0, 41, 85, 80, 0, 42, 85, 64, 2, 165, 85, 0, 42, 85, 84, 0, 0, 10, 160, 0, 0, 42, 168, 0, 0, 0, 0, 0], [255, 192, 0, 255, 255, 0, 0, 63, 252, 0, 0, 15, 240, 0, 0, 3, 192, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 0, 252, 0, 0, 3, 252, 0, 0, 15, 240, 0, 0, 63, 192, 0, 0, 255, 240, 0, 3, 255, 255, 0, 0, 255, 255, 192, 3, 255], [0, 0, 84, 0, 0, 1, 85, 0, 0, 1, 69, 0, 0, 5, 1, 64, 0, 5, 0, 80, 0, 20, 4, 81, 0, 20, 1, 84, 4, 81, 0, 80, 1, 84, 2, 160, 2, 160, 11, 232, 11, 232, 47, 170, 43, 170, 42, 170, 42, 170, 10, 168, 10, 168, 2, 160, 2, 160, 0, 0], Wb, ed, fd, gd, hd, id, jd, kd, ld, md, nd, od, pd, ed, fd, gd, hd, id, jd, kd, ld, md, nd, od, pd, [175, 255, 170, 255, 250, 235, 254, 190, 191, 235, 250, 250, 255, 175, 175, 254, 171, 255, 234, 191], Vb, [90, 90, 90, 90, 90, 150, 150, 150, 150, 150, 165, 165, 165, 165, 165, 150, 150, 150, 150, 150], Vb, [175, 175, 175, 175, 175, 235, 235, 235, 235, 235, 250, 250, 250, 250, 250, 190, 190, 190, 190, 190], Vb, [95, 255, 85, 255, 245, 215, 253, 125, 127, 215, 245, 245, 255, 95, 95, 253, 87, 255, 213, 127], Vb, [175, 255, 170, 255, 250, 215, 253, 125, 127, 215, 250, 250, 255, 175, 175, 253, 87, 255, 213, 127], Vb, [90, 90, 90, 90, 90, 150, 150, 150, 150, 150, 90, 90, 90, 90, 90, 150, 150, 150, 150, 150], Vb, [175, 175, 175, 175, 175, 215, 215, 215, 215, 215, 245, 245, 245, 245, 245, 190, 190, 190, 190, 190], Vb, [250, 250, 250, 250, 250, 190, 190, 190, 190, 190, 175, 175, 175, 175, 175, 190, 190, 190, 190, 190], Vb, Vb, [240, 255, 0, 255, 0, 63, 0, 15, 0, 15, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 15, 0, 63, 0, 63, 195, 255, 15, 255], Vb, [255, 255, 192, 3, 255, 255, 255, 252, 0, 0, 63, 255, 255, 240, 0, 0, 3, 255, 252, 0, 0, 0, 0, 63, 240, 0, 0, 0, 0, 255, 255, 0, 0, 0, 0, 15], Vb, [255, 240, 255, 0, 252, 0, 240, 0, 240, 0, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 0, 240, 0, 240, 0, 252, 0, 255, 195, 255, 15], Vb, [252, 0, 0, 0, 0, 63, 240, 0, 0, 0, 0, 255, 255, 0, 0, 0, 0, 15, 255, 192, 0, 0, 3, 255, 255, 252, 0, 0, 63, 255, 255, 255, 192, 3, 255, 255], Vb, [240, 240, 240, 240, 240, 255, 252, 0, 0, 0, 0, 63, 240, 0, 0, 0, 0, 255, 255, 0, 0, 0, 0, 15, 255, 192, 0, 0, 0, 63, 255, 0, 0, 0, 0, 255], Vb, [252, 60, 60, 60, 60, 63, 240, 0, 0, 0, 0, 255, 255, 0, 0, 0, 0, 15, 252, 0, 0, 0, 0, 63, 240, 0, 0, 0, 0, 255, 255, 0, 0, 0, 0, 15, 255, 195, 195, 195, 195, 255, 255, 15, 15, 15, 15, 255], [0, 0, 0, 0, 0, 5, 85, 64, 0, 23, 85, 80, 0, 93, 85, 84, 0, 23, 85, 16, 0, 5, 84, 64, 0, 1, 81, 0, 0, 0, 84, 0, 0, 0, 16, 0, 0, 0, 0, 0], qd, Vb, qd, [0, 15, 0, 0, 0, 63, 192, 0, 0, 48, 192, 0, 2, 170, 161, 85, 10, 170, 165, 85, 42, 170, 165, 0, 170, 170, 165, 85, 130, 168, 33, 85, 60, 163, 192, 0, 195, 12, 48, 0, 195, 12, 48, 0, 60, 3, 192, 0], [255, 192, 63, 255, 255, 0, 15, 255, 252, 0, 12, 0, 240, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 3, 255, 0, 0, 3, 255, 0, 240, 15, 255], [0, 0, 240, 0, 0, 3, 252, 0, 0, 3, 12, 0, 85, 74, 170, 128, 85, 90, 170, 160, 0, 90, 170, 168, 85, 90, 170, 170, 85, 72, 42, 130, 0, 3, 202, 60, 0, 12, 48, 195, 0, 12, 48, 195, 0, 3, 192, 60], [255, 252, 3, 255, 255, 240, 0, 255, 0, 48, 0, 63, 0, 0, 0, 15, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 255, 192, 0, 0, 255, 192, 0, 0, 255, 240, 15, 0], Vb, [192, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 0, 0, 3]],
            cgatitledat: [254, 0, 0, 254, 0, 0, 254, 208, 0, 254, 80, 170, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 254, 80, 170, 254, 164, 0, 60, 0, 240, 0, 0, 63, 240, 60, 63, 240, 15, 254, 7, 0, 255, 254, 8, 0, 240, 3, 252, 0, 255, 254, 5, 0, 255, 195, 254, 5, 0, 63, 192, 15, 254, 32, 0, 3, 0, 0, 3, 0, 0, 3, 192, 60, 3, 192, 254, 8, 0, 15, 254, 10, 0, 60, 0, 15, 254, 4, 0, 60, 0, 15, 254, 4, 0, 3, 192, 240, 15, 254, 32, 0, 12, 3, 3, 0, 192, 0, 0, 240, 207, 15, 0, 255, 0, 63, 255, 240, 0, 0, 63, 255, 0, 63, 255, 240, 15, 240, 0, 15, 240, 0, 60, 0, 15, 254, 4, 0, 15, 0, 3, 0, 3, 255, 0, 63, 252, 0, 255, 252, 15, 255, 15, 15, 252, 3, 255, 0, 3, 255, 255, 0, 15, 252, 254, 17, 0, 12, 12, 0, 0, 192, 0, 0, 240, 207, 12, 0, 15, 0, 3, 192, 3, 192, 15, 0, 15, 0, 3, 240, 3, 240, 3, 192, 0, 240, 0, 60, 0, 15, 254, 5, 0, 255, 192, 0, 240, 0, 240, 3, 192, 0, 15, 0, 0, 240, 51, 195, 0, 15, 0, 240, 0, 60, 3, 192, 240, 3, 192, 254, 16, 0, 12, 3, 3, 0, 192, 0, 0, 63, 3, 240, 0, 15, 0, 3, 192, 3, 192, 15, 0, 15, 0, 3, 192, 3, 192, 3, 192, 0, 240, 0, 60, 0, 15, 254, 6, 0, 63, 0, 240, 0, 240, 3, 192, 0, 15, 0, 0, 60, 51, 195, 0, 0, 60, 240, 0, 60, 0, 0, 255, 255, 192, 254, 3, 0, 3, 240, 254, 6, 15, 254, 5, 0, 3, 0, 0, 3, 254, 3, 0, 63, 3, 240, 0, 15, 0, 3, 192, 3, 192, 15, 0, 15, 0, 3, 192, 3, 192, 3, 192, 0, 240, 0, 60, 0, 15, 254, 4, 0, 12, 0, 3, 192, 240, 0, 240, 3, 192, 0, 15, 0, 0, 15, 192, 252, 0, 15, 0, 240, 0, 60, 0, 0, 240, 254, 6, 0, 240, 3, 255, 3, 252, 0, 252, 254, 6, 0, 60, 0, 240, 254, 3, 0, 12, 0, 192, 0, 15, 0, 3, 192, 3, 192, 3, 192, 255, 0, 3, 192, 3, 192, 3, 192, 0, 240, 0, 60, 0, 15, 254, 4, 0, 15, 240, 15, 0, 60, 3, 192, 3, 192, 0, 3, 195, 0, 3, 0, 48, 0, 15, 3, 240, 0, 60, 0, 0, 60, 15, 254, 5, 0, 240, 0, 60, 254, 4, 15, 254, 0, 0, 254, 0, 0, 254, 0, 0, 254, 146, 0, 254, 80, 170, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 168, 254, 39, 0, 170, 254, 38, 0, 42, 254, 80, 170, 254, 164, 0, 3, 255, 254, 78, 0, 192, 0, 12, 0, 0, 3, 192, 60, 3, 192, 15, 254, 7, 0, 15, 254, 8, 0, 240, 0, 60, 0, 15, 254, 4, 0, 15, 192, 63, 254, 5, 0, 192, 240, 15, 254, 32, 0, 3, 0, 252, 3, 254, 3, 0, 240, 207, 3, 254, 9, 0, 15, 254, 10, 0, 60, 0, 15, 254, 4, 0, 60, 0, 3, 254, 4, 0, 3, 192, 0, 15, 254, 32, 0, 12, 12, 0, 0, 192, 0, 0, 240, 207, 12, 0, 15, 0, 3, 240, 15, 0, 3, 192, 63, 0, 3, 240, 15, 240, 15, 0, 0, 240, 0, 60, 0, 15, 254, 4, 0, 3, 252, 0, 0, 60, 3, 192, 3, 192, 0, 15, 0, 0, 240, 15, 0, 192, 15, 0, 192, 0, 63, 3, 192, 60, 15, 254, 17, 0, 12, 12, 0, 0, 192, 0, 0, 63, 3, 252, 0, 15, 0, 3, 192, 3, 192, 15, 0, 15, 0, 3, 192, 3, 192, 3, 192, 0, 240, 0, 60, 0, 15, 254, 5, 0, 3, 252, 0, 240, 0, 240, 3, 192, 0, 15, 0, 0, 60, 51, 195, 0, 0, 3, 240, 0, 60, 0, 0, 240, 3, 192, 254, 4, 0, 240, 3, 252, 3, 252, 3, 252, 254, 5, 0, 3, 0, 252, 3, 254, 3, 0, 63, 3, 240, 0, 15, 0, 3, 192, 3, 192, 15, 0, 15, 0, 3, 192, 3, 192, 3, 192, 0, 240, 0, 60, 0, 15, 254, 4, 0, 12, 0, 3, 192, 240, 0, 240, 3, 192, 0, 15, 0, 0, 15, 192, 252, 0, 3, 192, 240, 0, 60, 0, 0, 240, 254, 6, 0, 240, 254, 4, 15, 0, 15, 254, 6, 0, 192, 0, 12, 254, 3, 0, 12, 0, 192, 0, 15, 0, 3, 192, 3, 192, 15, 0, 15, 0, 3, 192, 3, 192, 3, 192, 0, 240, 0, 60, 0, 15, 254, 4, 0, 15, 0, 3, 192, 240, 0, 240, 3, 192, 0, 15, 3, 0, 15, 192, 252, 0, 15, 0, 240, 0, 60, 0, 0, 240, 0, 192, 254, 4, 0, 240, 0, 254, 3, 15, 0, 15, 254, 6, 0, 3, 255, 254, 4, 0, 12, 0, 192, 0, 255, 240, 63, 252, 63, 252, 0, 255, 15, 252, 63, 252, 63, 252, 63, 252, 15, 255, 3, 255, 192, 255, 240, 254, 3, 0, 12, 15, 240, 0, 15, 252, 0, 63, 252, 0, 0, 252, 0, 3, 0, 48, 0, 3, 252, 63, 3, 255, 192, 0, 15, 240, 254, 4, 0, 15, 255, 3, 240, 3, 252, 3, 252, 0, 0, 0, 0, 0, 0, 0]
        };
    }
).call(this);
