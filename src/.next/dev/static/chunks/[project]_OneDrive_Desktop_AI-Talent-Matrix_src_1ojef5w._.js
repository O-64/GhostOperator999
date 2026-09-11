(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/OneDrive/Desktop/AI-Talent-Matrix/src/lib/tokenStorage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tokenStorage",
    ()=>tokenStorage
]);
const TOKEN_KEY = 'atm_access_token';
const tokenStorage = {
    get () {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return localStorage.getItem(TOKEN_KEY);
    },
    set (token) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        localStorage.setItem(TOKEN_KEY, token);
    },
    clear () {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        localStorage.removeItem(TOKEN_KEY);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/AI-Talent-Matrix/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "addProfileView",
    ()=>addProfileView,
    "applyToJob",
    ()=>applyToJob,
    "batchMatch",
    ()=>batchMatch,
    "checkHealth",
    ()=>checkHealth,
    "clearCopilotHistory",
    ()=>clearCopilotHistory,
    "computeMatch",
    ()=>computeMatch,
    "copilotQuery",
    ()=>copilotQuery,
    "createApplication",
    ()=>createApplication,
    "createJob",
    ()=>createJob,
    "getCandidate",
    ()=>getCandidate,
    "getCopilotHistory",
    ()=>getCopilotHistory,
    "getMe",
    ()=>getMe,
    "listApplications",
    ()=>listApplications,
    "listCandidates",
    ()=>listCandidates,
    "listJobs",
    ()=>listJobs,
    "loginCandidate",
    ()=>loginCandidate,
    "loginRecruiter",
    ()=>loginRecruiter,
    "logoutApi",
    ()=>logoutApi,
    "signupCandidate",
    ()=>signupCandidate,
    "signupRecruiter",
    ()=>signupRecruiter,
    "updateApplicationStage",
    ()=>updateApplicationStage,
    "updateCandidate",
    ()=>updateCandidate,
    "updateRecruiter",
    ()=>updateRecruiter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$Ghostoperator$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/OneDrive/Desktop/Ghostoperator/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI-Talent-Matrix/src/lib/tokenStorage.ts [app-client] (ecmascript)");
;
const API_URL = ("TURBOPACK compile-time value", "http://localhost:8000/v1") || 'http://localhost:8000/v1';
class ApiError extends Error {
    status;
    constructor(status, message){
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}
function parseErrorMessage(body, fallback) {
    if (!body || typeof body !== 'object') return fallback;
    const detail = body.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0];
        if (typeof first === 'object' && first && 'msg' in first) {
            return String(first.msg);
        }
    }
    return fallback;
}
async function request(path, options = {}) {
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenStorage"].get();
    const headers = {
        ...options.body ? {
            'Content-Type': 'application/json'
        } : {},
        ...options.headers
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    });
    if (!res.ok) {
        const body = await res.json().catch(()=>null);
        throw new ApiError(res.status, parseErrorMessage(body, res.statusText));
    }
    if (res.status === 204) return undefined;
    return res.json();
}
async function loginCandidate(email, password) {
    const data = await request('/auth/candidate/login', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password
        })
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenStorage"].set(data.access_token);
    return data.user;
}
async function signupCandidate(payload) {
    const data = await request('/auth/candidate/signup', {
        method: 'POST',
        body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            mobile: payload.mobile,
            password: payload.password,
            experience_type: payload.experienceType,
            previous_company: payload.previousCompany,
            current_company: payload.currentCompany,
            reason_for_change: payload.reasonForChange,
            post: payload.post
        })
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenStorage"].set(data.access_token);
    return data.user;
}
async function loginRecruiter(email, password) {
    const data = await request('/auth/recruiter/login', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password
        })
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenStorage"].set(data.access_token);
    return data.user;
}
async function signupRecruiter(payload) {
    const data = await request('/auth/recruiter/signup', {
        method: 'POST',
        body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            password: payload.password,
            company: payload.company,
            title: payload.title,
            industry: payload.industry,
            team_size: payload.teamSize,
            website: payload.website,
            headquarters: payload.headquarters,
            company_description: payload.companyDescription
        })
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenStorage"].set(data.access_token);
    return data.user;
}
async function getMe() {
    return request('/auth/me');
}
function logoutApi() {
    __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenStorage"].clear();
}
async function listCandidates(params) {
    const search = new URLSearchParams();
    if (params?.q) search.set('q', params.q);
    if (params?.skill) search.set('skill', params.skill);
    if (params?.location) search.set('location', params.location);
    if (params?.experienceType) search.set('experienceType', params.experienceType);
    if (params?.college) search.set('college', params.college);
    if (params?.sortBy) search.set('sortBy', params.sortBy);
    const qs = search.toString();
    return request(`/candidates${qs ? `?${qs}` : ''}`);
}
async function getCandidate(id) {
    return request(`/candidates/${encodeURIComponent(id)}`);
}
async function updateCandidate(id, patch) {
    return request(`/candidates/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
    });
}
async function addProfileView(candidateId, payload) {
    return request(`/candidates/${encodeURIComponent(candidateId)}/profile-view`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
async function updateRecruiter(id, patch) {
    return request(`/recruiters/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
    });
}
async function listJobs(recruiterId) {
    const qs = recruiterId ? `?recruiterId=${encodeURIComponent(recruiterId)}` : '';
    const jobs = await request(`/jobs${qs}`);
    return jobs.map(normalizeJob);
}
async function createJob(payload) {
    const job = await request('/jobs', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return normalizeJob(job);
}
function normalizeJob(job) {
    return {
        ...job,
        postedAt: job.postedAt ? typeof job.postedAt === 'string' ? job.postedAt : String(job.postedAt) : undefined
    };
}
async function listApplications() {
    const apps = await request('/applications');
    return apps.map(normalizeApplication);
}
async function createApplication(payload) {
    const app = await request('/applications', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return normalizeApplication(app);
}
async function updateApplicationStage(appId, stage, extras) {
    const app = await request(`/applications/${encodeURIComponent(appId)}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({
            stage,
            ...extras
        })
    });
    return normalizeApplication(app);
}
async function applyToJob(jobId) {
    const app = await request(`/applications/apply/${encodeURIComponent(jobId)}`, {
        method: 'POST'
    });
    return normalizeApplication(app);
}
function normalizeApplication(app) {
    return {
        ...app,
        createdAt: typeof app.createdAt === 'string' ? app.createdAt : String(app.createdAt),
        updatedAt: typeof app.updatedAt === 'string' ? app.updatedAt : String(app.updatedAt)
    };
}
async function computeMatch(candidateId, requiredSkills) {
    return request('/match/compute', {
        method: 'POST',
        body: JSON.stringify({
            candidateId,
            requiredSkills
        })
    });
}
async function batchMatch(payload) {
    return request('/match/batch', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
async function copilotQuery(query) {
    return request('/copilot/query', {
        method: 'POST',
        body: JSON.stringify({
            query
        })
    });
}
async function getCopilotHistory() {
    return request('/copilot/history');
}
async function clearCopilotHistory() {
    return request('/copilot/history', {
        method: 'DELETE'
    });
}
async function checkHealth() {
    return request('/health');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/AI-Talent-Matrix/src/context/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$Ghostoperator$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/Ghostoperator/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$Ghostoperator$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/Ghostoperator/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI-Talent-Matrix/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI-Talent-Matrix/src/lib/tokenStorage.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$Ghostoperator$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const AuthProvider = ({ children })=>{
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$Ghostoperator$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$Ghostoperator$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const refreshUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$Ghostoperator$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[refreshUser]": async ()=>{
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenStorage"].get()) {
                setUser(null);
                return;
            }
            try {
                const me = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMe"]();
                setUser(me);
            } catch  {
                __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenStorage"].clear();
                setUser(null);
            }
        }
    }["AuthProvider.useCallback[refreshUser]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$Ghostoperator$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            ({
                "AuthProvider.useEffect": async ()=>{
                    if (__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$tokenStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenStorage"].get()) {
                        await refreshUser();
                    }
                    setIsLoading(false);
                }
            })["AuthProvider.useEffect"]();
        }
    }["AuthProvider.useEffect"], [
        refreshUser
    ]);
    const login = async (email, password, role)=>{
        try {
            const loggedIn = role === 'candidate' ? await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loginCandidate"](email, password) : await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loginRecruiter"](email, password);
            setUser(loggedIn);
            return {
                success: true
            };
        } catch (err) {
            const message = err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] ? err.message : 'Failed to login';
            return {
                success: false,
                error: message
            };
        }
    };
    const signupCandidate = async (data)=>{
        try {
            const created = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signupCandidate"]({
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                password: data.password,
                experienceType: data.experienceType,
                previousCompany: data.previousCompany,
                currentCompany: data.currentCompany,
                reasonForChange: data.reasonForChange,
                post: data.post
            });
            setUser(created);
            return {
                success: true
            };
        } catch (err) {
            const message = err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] ? err.message : 'Failed to sign up';
            return {
                success: false,
                error: message
            };
        }
    };
    const signupRecruiter = async (data)=>{
        try {
            const created = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signupRecruiter"]({
                name: data.name,
                email: data.email,
                password: data.password,
                company: data.company,
                title: data.title,
                industry: data.industry,
                teamSize: data.teamSize,
                website: data.website,
                headquarters: data.headquarters,
                companyDescription: data.companyDescription
            });
            setUser(created);
            return {
                success: true
            };
        } catch (err) {
            const message = err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] ? err.message : 'Failed to sign up';
            return {
                success: false,
                error: message
            };
        }
    };
    const updateCandidateProfile = async (patch)=>{
        if (!user || user.role !== 'candidate') return;
        const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateCandidate"](user.id, patch);
        setUser(updated);
    };
    const updateRecruiterProfile = async (patch)=>{
        if (!user || user.role !== 'recruiter') return;
        const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateRecruiter"](user.id, patch);
        setUser(updated);
    };
    const logout = ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI$2d$Talent$2d$Matrix$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logoutApi"]();
        setUser(null);
    };
    const signup = (_data)=>{
    // Legacy compat for landing page Navbar — demo-only
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$Ghostoperator$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            login,
            signupCandidate,
            signupRecruiter,
            updateCandidateProfile,
            updateRecruiterProfile,
            refreshUser,
            logout,
            signup
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/AI-Talent-Matrix/src/context/AuthContext.tsx",
        lineNumber: 135,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AuthProvider, "kDeyyYjYQR6lMEChU97no/5IVA4=");
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$Ghostoperator$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
_s1(useAuth, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=%5Bproject%5D_OneDrive_Desktop_AI-Talent-Matrix_src_1ojef5w._.js.map