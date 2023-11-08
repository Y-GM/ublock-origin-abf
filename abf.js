/// abf.js
/// alias abf.js
(function() {
    const sessionName = '@user__'
    const hashMini = str => {
        const json = `${JSON.stringify(str)}`
        let i, len, hash = 0x811c9dc5
        for (i = 0, len = json.length; i < len; i++) {
            hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
        }
        return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
    }
    const computeRandomValues = () => {
        const listRand = (list) => list[Math.floor(Math.random() * list.length)]
        const evenRand = (min, max) =>
            (Math.floor(Math.random() * ((max / 2) - min + 1)) + min) * 2
        const rand = (min, max) =>
            (Math.floor(Math.random() * (max - min + 1)) + min)
        // Device GPU
        // https://www.primegrid.com/gpu_list.php
        const webglRenderer = () => {
            const macRenderers = [{
                gpu: 'AMD Radeon',
                model: `20${listRand(['HD 7950', 'Pro 580', 'RX 570', 'RX Vega 56'])} Compute Engine`
            },
            {
                gpu: 'NVIDIA GeForce GTX',
                model: listRand(['675MX', '680'])
            }
            ]
            const renderers = [{
                gpu: 'NVIDIA GeForce RTX',
                model: `20${listRand([7, 8])}0${listRand(['', ' Super'])}`
            },
            {
                gpu: 'NVIDIA GeForce GTX',
                model: `10${listRand([5, 6, 7, 8])}0${listRand(['', ' Ti'])}`
            },
            {
                gpu: 'Radeon',
                model: `RX ${listRand([560, 570, 580])} Series`
            }
            ]
            const randomRenderer = (
                navigator.platform == 'MacIntel' ? listRand(macRenderers) : listRand(renderers)
            )
            const {
                gpu,
                model
            } = randomRenderer
            const randomizedRenderer = `${gpu} ${model}`
            const extension = {
                37446: `ANGLE (${randomizedRenderer} vs_${rand(1, 5)}_0 ps_${rand(1, 5)}_0)`
            }
            return extension
        }
        const webglExtensionComputed = webglRenderer()
        // canvasContext
        const canvas = () => {
            const randomRGBA = () => {
                const clr = () => Math.round(Math.random() * 255)
                return `rgba(${clr()},${clr()},${clr()},${Math.random().toFixed(1)})`
            }
            const randomFont = () => {
                const fontFamily = [
                    'Arial', 'Courier', 'Georgia', 'Helvetica', 'Impact', 'monospace', 'Tahoma', 'Times', 'Verdana'
                ]
                const fontSize = Math.floor((Math.random() * 100) + 12)
                const rand = Math.floor(Math.random() * fontFamily.length)
                return `${fontSize}px ${fontFamily[rand]}`
            }
            const fillStyle = randomRGBA()
            const shadowColor = randomRGBA()
            const strokeStyle = randomRGBA()
            const font = randomFont()
            const clearColor = [...Array(4)].map(() => Math.random().toFixed(1))
            const randomChar = () => {
                const capitalize = Math.random() < 0.5
                const str = String.fromCharCode(97 + Math.floor(Math.random() * 26))
                return capitalize ? str.toUpperCase() : str
            }
            const randomChars = [
                randomChar(),
                randomChar(),
                randomChar(),
                randomChar(),
                randomChar(),
            ]
            return {
                fillStyle,
                shadowColor,
                strokeStyle,
                font,
                clearColor,
                randomChars
            }
        }
        const canvasContextComputed = canvas()
        // clientRects
        const clientRectsOffsetComputed = rand(10, 99)
        // audioData
        const channelNoise = Math.random() * 0.0000001
        const frequencyNoise = Math.random() * 0.001
        const audioDataComputed = {
            channelNoise,
            frequencyNoise
        }
        // create hashes
        const hash = hashMini({
            webglExtensionComputed,
            canvasContextComputed,
            clientRectsOffsetComputed,
            audioDataComputed
        })
        // log exection
        const timestamp = new Date().toLocaleTimeString()
        console.log(`${timestamp}: Setting up new randomization... ${hash}`)
        return {
            timestamp,
            hash,
            webglExtensionComputed,
            canvasContextComputed,
            clientRectsOffsetComputed,
            audioDataComputed
        }
    }
    // set session
    if (!sessionStorage.getItem(sessionName)) {
        sessionStorage.setItem(sessionName, JSON.stringify(computeRandomValues()))
    }
    // get session
    const {
        timestamp,
        hash,
        webglExtensionComputed,
        canvasContextComputed,
        clientRectsOffsetComputed,
        audioDataComputed
    } = JSON.parse(sessionStorage.getItem(sessionName))
    const sessionProtection = `uBlock Origin ABF Session: ${hash} @${timestamp}`
    console.log(sessionProtection)
    // webgl
    function computeGetParameter(type) {
        const nativeGetParameter = (
            type == 'webgl2' ?
                WebGL2RenderingContext.prototype.getParameter :
                WebGLRenderingContext.prototype.getParameter
        )
        return function getParameter(x) {
            return (
                webglExtensionComputed === false ? nativeGetParameter.apply(this, arguments) :
                webglExtensionComputed[x] ? webglExtensionComputed[x] :
                nativeGetParameter.apply(this, arguments)
            )
        }
    }
    // canvas
    const nativeGetContext = HTMLCanvasElement.prototype.getContext
    const nativeToDataURL = HTMLCanvasElement.prototype.toDataURL
    const nativeToBlob = HTMLCanvasElement.prototype.toBlob
    const nativeGetImageData = CanvasRenderingContext2D.prototype.getImageData
    function getContext(contextType, contextAttributes) {
        this._contextType = contextType
        return nativeGetContext.apply(this, arguments)
    }
    function randomizeContext2D(context) {
        const {
            fillStyle,
            shadowColor,
            strokeStyle,
            font
        } = canvasContextComputed
        context.textBaseline = 'top'
        context.textBaseline = 'alphabetic'
        context.fillStyle = fillStyle
        context.shadowColor = shadowColor
        context.strokeStyle = strokeStyle
        context.fillText('.', 4, 17)
        context.font = font
        return context
    }
    function randomizeContextWebgl(canvas) {
        const context = nativeGetContext.apply(canvas, [canvas._contextType])
        if (context) {
            const {
                clearColor
            } = canvasContextComputed
            context.clearColor(...clearColor)
        }
        return context
    }
    function randomizeWebgl(dataURI) {
        const chunks = dataURI.split('+')
        const lastChunk = chunks[chunks.length-1]
        const [rand1, rand2, rand3, rand4, rand5] = canvasContextComputed.randomChars
        const chunkRandomized = lastChunk.replace(/./g, (char, i) => {
            const len = lastChunk.length
            return (
                i == len-1 ? rand1 : 
                i == len-3 ? rand2 :
                i == len-5 ? rand3 :
                i == len-7 ? rand4 :
                i == len-9 ? rand5 :
                char
            )
        })
        chunks.splice(-1, 1, chunkRandomized)
        return chunks.join('+')
    }
    function toDataURL() {
        if (this._contextType == '2d') {
            const context = nativeGetContext.apply(this, ['2d'])
            randomizeContext2D(context)
            return nativeToDataURL.apply(this, arguments)
        }
        else if (this._contextType == 'webgl' || this._contextType == 'webgl2') {
            const dataURI = nativeToDataURL.apply(this, arguments)
            return randomizeWebgl(dataURI)
        }
        return nativeToDataURL.apply(this, arguments)
    }
    function toBlob() {
        if (this._contextType == '2d') {
            const context = nativeGetContext.apply(this, ['2d'])
            randomizeContext2D(context)
            return nativeToBlob.apply(this, arguments)
        }
        else if (this._contextType == 'webgl' || this._contextType == 'webgl2') {
            randomizeContextWebgl(this)
            return nativeToBlob.apply(this, arguments)
        }
        return nativeToBlob.apply(this, arguments)
    }
    function getImageData() {
        const context = randomizeContext2D(this)
        return nativeGetImageData.apply(context, arguments)
    }
    // clientRects
    const nativeElementGetClientRects = Element.prototype.getClientRects
    const nativeElementGetBoundingClientRect = Element.prototype.getBoundingClientRect
    const nativeRangeGetClientRects = Range.prototype.getClientRects
    const nativeRangeGetBoundingClientRect = Range.prototype.getBoundingClientRect
    const randomClient = type => {
        const tryRandomNumber = (num, computedOffset) => {
            const shouldLieNumber = num => {
                const decimals = num && num.toString().split('.')[1]
                return decimals && decimals.length > 10 ? true : false
            }
            if (shouldLieNumber(num)) {
                const str = '' + num
                const offset = '' + computedOffset
                const randomizedNumber = +(
                    str.slice(0, -3) + offset + str.slice(-1)
                )
                return randomizedNumber
            }
            return num
        }
        const method = (
            type == 'rangeRects' ? nativeRangeGetClientRects :
            type == 'rangeBounding' ? nativeRangeGetBoundingClientRect :
            type == 'elementRects' ? nativeElementGetClientRects :
            type == 'elementBounding' ? nativeElementGetBoundingClientRect : ''
        )
        const domRectify = (client) => {
            const props = ['bottom', 'height', 'left', 'right', 'top', 'width', 'x', 'y']
            if (client.length) {
                let i, len = client.length
                for (i = 0; i < len; i++) {
                    client[i][props[0]] = tryRandomNumber(client[i][props[0]], clientRectsOffsetComputed)
                    client[i][props[1]] = tryRandomNumber(client[i][props[1]], clientRectsOffsetComputed)
                    client[i][props[2]] = tryRandomNumber(client[i][props[2]], clientRectsOffsetComputed)
                    client[i][props[3]] = tryRandomNumber(client[i][props[3]], clientRectsOffsetComputed)
                    client[i][props[4]] = tryRandomNumber(client[i][props[4]], clientRectsOffsetComputed)
                    client[i][props[5]] = tryRandomNumber(client[i][props[5]], clientRectsOffsetComputed)
                    client[i][props[6]] = tryRandomNumber(client[i][props[6]], clientRectsOffsetComputed)
                    client[i][props[7]] = tryRandomNumber(client[i][props[7]], clientRectsOffsetComputed)
                }
                return client
            }
            props.forEach(prop => {
                client[prop] = tryRandomNumber(client[prop], clientRectsOffsetComputed)
            })
            return client
        }
        function getBoundingClientRect() {
            const client = method.apply(this, arguments)
            return domRectify(client)
        }
        function getClientRects() {
            const client = method.apply(this, arguments)
            return domRectify(client)
        }
        return (
            type == 'rangeRects' || type == 'elementRects' ? getClientRects :
            getBoundingClientRect
        )
    }
    // audioData
    const {
        channelNoise,
        frequencyNoise
    } = audioDataComputed
    const nativeGetChannelData = AudioBuffer.prototype.getChannelData
    const nativeCopyFromChannel = AudioBuffer.prototype.copyFromChannel
    const nativeGetByteFrequencyData = AnalyserNode.prototype.getByteFrequencyData
    const nativeGetFloatFrequencyData = AnalyserNode.prototype.getFloatFrequencyData
    function computePCMData(obj, args) {
        const data = nativeGetChannelData.apply(obj, args)
        let i, len = data ? data.length : 0
        for (i = 0; i < len; i++) {
            // ensure audio is within range of -1 and 1
            const audio = data[i]
            const noisified = audio + channelNoise
            data[i] = noisified > -1 && noisified < 1 ? noisified : audio
        }
        obj._pcmDataComputedChannel = args[0]
        obj._pcmDataComputed = data
        return data
    }
    function getChannelData(channel) {
        // if pcm data is already computed to this AudioBuffer Channel then return it
        if (this._pcmDataComputed && this._pcmDataComputedChannel == channel) {
            return this._pcmDataComputed
        }
        // else compute pcm data to this AudioBuffer Channel and return it
        const data = computePCMData(this, arguments)
        return data
    }
    function copyFromChannel(destination, channel) {
        // if pcm data is not yet computed to this AudioBuffer Channel then compute it
        if (!(this._pcmDataComputed && this._pcmDataComputedChannel == channel)) {
            computePCMData(this, [channel])
        }
        // else make no changes to this AudioBuffer Channel (seeing it is already computed)
        return nativeCopyFromChannel.apply(this, arguments)
    }
    function computeFrequencyData(data) {
        let i, len = data.length
        for (i = 0; i < len; i++) {
            data[i] += frequencyNoise
        }
        return
    }
    function getByteFrequencyData(uint8Arr) {
        nativeGetByteFrequencyData.apply(this, arguments)
        computeFrequencyData(uint8Arr)
        return
    }
    function getFloatFrequencyData(float32Arr) {
        nativeGetFloatFrequencyData.apply(this, arguments)
        computeFrequencyData(float32Arr)
        return
    }
    // Detect Fingerprinting
    // Property API and Fingerprint Rank
    const propAPI = {
        appVersion: ['Navigator.prototype.appVersion', 1],
        deviceMemory: ['Navigator.prototype.deviceMemory', 3],
        doNotTrack: ['Navigator.prototype.doNotTrack', 1],
        hardwareConcurrency: ['Navigator.prototype.hardwareConcurrency', 3],
        languages: ['Navigator.prototype.languages', 1],
        maxTouchPoints: ['Navigator.prototype.maxTouchPoints', 1],
        mimeTypes: ['Navigator.prototype.mimeTypes', 6],
        platform: ['Navigator.prototype.platform', 1],
        plugins: ['Navigator.prototype.plugins', 6],
        userAgent: ['Navigator.prototype.userAgent', 1],
        vendor: ['Navigator.prototype.vendor', 1],
        connection: ['Navigator.prototype.connection', 1],
        cookieEnabled: ['Navigator.prototype.cookieEnabled', 1],
        getBattery: ['Navigator.prototype.getBattery', 1],
        getGamepads: ['Navigator.prototype.getGamepads', 1],
        width: ['Screen.prototype.width', 1],
        height: ['Screen.prototype.height', 1],
        availWidth: ['Screen.prototype.availWidth', 1],
        availHeight: ['Screen.prototype.availHeight', 1],
        availTop: ['Screen.prototype.availTop', 1],
        availLeft: ['Screen.prototype.availLeft', 1],
        colorDepth: ['Screen.prototype.colorDepth', 1],
        pixelDepth: ['Screen.prototype.pixelDepth', 1],
        getTimezoneOffset: ['Date.prototype.getTimezoneOffset', 1],
        resolvedOptions: ['Intl.DateTimeFormat.prototype.resolvedOptions', 1],
        acos: ['acos: Math.acos', 1],
        acosh: ['Math.acosh', 1],
        asin: ['Math.asin', 1],
        asinh: ['Math.asinh', 1],
        cosh: ['Math.cosh', 1],
        expm1: ['Math.expm1', 1],
        sinh: ['Math.sinh', 1],
        enumerateDevices: ['navigator.mediaDevices.enumerateDevices', 1],
        now: ['Performance.prototype.now', 1],
        getBoundingClientRect: ['prototype.getBoundingClientRect', 4],
        getClientRects: ['prototype.getClientRects', 4],
        shaderSource: ['WebGLRenderingContext.prototype.shaderSource', 4],
        getExtension: ['WebGLRenderingContext.prototype.getExtension', 4],
        getParameter: ['WebGLRenderingContext.prototype.getParameter', 6],
        getSupportedExtensions: ['WebGLRenderingContext.prototype.getSupportedExtensions', 4],
        getContext: ['HTMLCanvasElement.prototype.getContext', 1],
        toDataURL: ['HTMLCanvasElement.prototype.toDataURL', 6],
        toBlob: ['HTMLCanvasElement.prototype.toBlob', 4],
        getImageData: ['CanvasRenderingContext2D.prototype.getImageData', 1],
        isPointInPath: ['CanvasRenderingContext2D.prototype.isPointInPath', 1],
        isPointInStroke: ['CanvasRenderingContext2D.prototype.isPointInStroke', 1],
        measureText: ['CanvasRenderingContext2D.prototype.measureText', 6],
        getChannelData: ['AudioBuffer.prototype.getChannelData', 8],
        copyFromChannel: ['AudioBuffer.prototype.copyFromChannel', 8],
        getByteFrequencyData: ['AnalyserNode.prototype.getByteFrequencyData', 8],
        getFloatFrequencyData: ['AnalyserNode.prototype.getFloatFrequencyData', 6],
        createDataChannel: ['RTCPeerConnection.prototype.createDataChannel', 3],
        createOffer: ['RTCPeerConnection.prototype.createOffer', 3],
        setRemoteDescription: ['RTCPeerConnection.prototype.setRemoteDescription', 3]
    }
    const randomChar = () => String.fromCharCode(97 + Math.floor(Math.random() * 26))
    const listRand = (list) => list[Math.floor(Math.random() * list.length)]
    const letter = randomChar()
    const errorStruct = {
        'RangeError': {
            firefox: [
                'invalid array length',
                'repeat count must be non-negative'
            ],
            chrome: [
                'Invalid array length',
                'Invalid count value'
            ]
        },
        'ReferenceError': {
            firefox: [
                `${letter} is not defined`,
                `assignment to undeclared variable ${letter}`,
                `can't access lexical declaration ${letter} before initialization`,
                'invalid assignment left-hand side'
            ],
            chrome: [
                `${letter} is not defined`,
                'invalid assignment left-hand side'
            ]
        },
        'SyntaxError': {
            firefox: [
                'function is a reserved identifier',
                'function statement requires a name',
                'identifier starts immediately after numeric literal',
                'illegal character',
                `invalid regular expression flag ${letter}`,
                'expected expression, got end of script',
                `redeclaration of formal parameter ${letter}`
            ],
            chrome: [
                'Unexpected reserved word',
                'Unexpected token',
                'Unexpected number',
                'Invalid or unexpected token',
                'Invalid regular expression flags',
                'Unexpected end of input',
                `Identifier ${letter} has already been declared`
            ]
        },
        'TypeError': {
            firefox: [
                `${letter} is not a function`,
                `${letter} is not iterable`,
                `${letter} is null`
            ],
            chrome: [
                `${letter} is not a function`,
                `${letter} is not iterable`,
                `Cannot read property ${letter} of null`
            ]
        }
    }
    const firefox = (navigator.userAgent.indexOf('Firefox') != -1)
    const errorType = listRand(Object.keys(errorStruct))
    // https://stackoverflow.com/questions/2255689/how-to-get-the-file-path-of-the-currently-executing-javascript-code
    const unknownSource = '[unknown source]'
    const getCurrentScript = () => {
        const jsURL = /(\/.+\.(js|html|htm))/gi
        const error = new Error()
        const jsPath = error.stack.match(jsURL)
        return jsPath ? 'https:' + jsPath[0] : unknownSource
    }
    const warningRank = 16 // total rank that triggers fingerprinting warning
    const scripts = {}
    const watch = prop => {
        const url = getCurrentScript()
        const propDescription = propAPI[prop][0]
        const randomError = listRand(errorStruct[errorType][(firefox ? 'firefox' : 'chrome')])
        const abort = (errorType, randomError) => {
            return (
                errorType == 'RangeError' ? new RangeError(randomError) :
                errorType == 'ReferenceError' ? new ReferenceError(randomError) :
                errorType == 'SyntaxError' ? new SyntaxError(randomError) :
                new TypeError(randomError)
            )
        }
        // abort creepy url if permission denied
        const sessionPermission = sessionStorage.getItem(sessionName + 'permit')
        const creeps = JSON.parse(sessionStorage.getItem(sessionName + 'creeps'))
        if (sessionPermission == 'deny' && creeps && creeps[url]) {
            console.log('aborting '+propDescription)
            const { timestamp } = JSON.parse(sessionStorage.getItem(sessionName + 'error'))
            const secondsPassed = (new Date() - timestamp) / 1000
            if (secondsPassed > 30) {
                sessionStorage.setItem(sessionName + 'error', JSON.stringify({ timestamp: +(new Date()), type: errorType, message: randomError }))
                const error = abort(errorType, randomError)
                throw error
            }
            else {
                const { type, message } = JSON.parse(sessionStorage.getItem(sessionName + 'error'))
                const error = abort(type, message)
                throw error
            }
        }
        // capture script
        const rank = propAPI[prop][1]
        const capturedScript = scripts[url]
        if (!capturedScript) {
            scripts[url] = {
                creep: false,
                rank,
                reads: { [propDescription]: true }
            }
        }
        // if new prop, add it to already captured script
        else if (!capturedScript.reads[propDescription]) {
            capturedScript.reads[propDescription] = true
            // compute rank increase
            const { reads } = capturedScript
            const readsLen = Object.keys(reads).length
            capturedScript.rank += (
                rank == 1 && readsLen >= 8 ? 4 :
                rank == 1 && readsLen >= 6 ? 3 :
                rank == 1 && readsLen >= 4 ? 2 :
                rank
            )
            // detect fingerprinting
            if (!capturedScript.creep && capturedScript.rank >= warningRank) {
                capturedScript.creep = true
                const unknown = url == unknownSource
                const reads = Object.keys(capturedScript.reads)
                const readsFormatted = reads.map(prop => prop.replace(/\.prototype/, '')).join('\n')
                if (!unknown) {
                    console.groupCollapsed(`Fingerprinting detected!`)
                    console.log(`Creepy script: ${url}`)
                    console.log(
                        `Detection triggered by ${reads.length} property reads:`,
                        '\n' + readsFormatted
                    )
                    console.log('\n\nScript Data:\n', capturedScript)
                    console.groupEnd()
                }
                const message = (confirmPermission, [url, session, reads]) => {
                    return '🤮 Fingerprinting detected!'
                    + (confirmPermission ? ' OK to allow or Cancel to abort\n' : '\n')
                    + '🛡 ' + session + '\n'
                    + '💩 Creepy script: ' + url + '\n'
                    + '🧐\n' + reads + '\n...' + '\n'
                }
                if ((creeps && !creeps[url]) || !sessionPermission) {
                    let permission = null
                    const creepyOrigin = sessionStorage.getItem(sessionName + 'creepyOrigin')
                    if (unknown && !creepyOrigin) {
                        sessionStorage.setItem(sessionName + 'creepyOrigin', true)
                        //const { origin } = location
                        //alert(message(false, [origin, sessionProtection, readsFormatted]))
                    }
                    else if (!unknown) {
                        //permission = confirm(message(true, [url, sessionProtection, readsFormatted]))
                    } 
                    if (permission) {
                        sessionStorage.setItem(sessionName + 'permit', 'allow')
                    }
                    else if (permission === false) {
                        sessionStorage.setItem(sessionName + 'permit', 'deny')
                        sessionStorage.setItem(sessionName + 'error', JSON.stringify({ timestamp: +(new Date()), type: errorType, message: randomError }))
                        if (creeps && !unknown) {
                            creeps[url] = true
                            sessionStorage.setItem(sessionName + 'creeps', JSON.stringify(creeps))
                        }
                        else if (!unknown) {
                            sessionStorage.setItem(sessionName + 'creeps', JSON.stringify({ [url]: true }))
                        }
                        const error = abort(errorType, randomError)
                        throw error
                    }
                }
            }
        }
        return
    }
    // difinify
    const intlProps = {
        resolvedOptions: Intl.DateTimeFormat.prototype.resolvedOptions
    }
    const mediaDeviceProps = {
        enumerateDevices: navigator.mediaDevices.enumerateDevices
    }
    const apiStructs = [{
        name: 'Navigator',
        proto: true,
        struct: {
            platform: navigator.platform,
            vendor: navigator.vendor,
            appVersion: navigator.appVersion,
            userAgent: navigator.userAgent,
            maxTouchPoints: navigator.maxTouchPoints,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            doNotTrack: navigator.doNotTrack,
            languages: navigator.languages,
            mimeTypes: navigator.mimeTypes,
            plugins: navigator.plugins,
            connection: navigator.connection,
            cookieEnabled: navigator.cookieEnabled,
            getBattery: navigator.getBattery,
            getGamepads: navigator.getGamepads
        }
    },
    {
        name: 'Screen',
        proto: true,
        struct: {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        }
    },
    {
        name: 'Date',
        proto: true,
        struct: {
            getTimezoneOffset: Date.prototype.getTimezoneOffset
        }
    },
    {
        name: 'Math',
        proto: false,
        struct: {
            acos: Math.acos,
            acosh: Math.acosh,
            asin: Math.asin,
            asinh: Math.asinh,
            cosh: Math.cosh,
            expm1: Math.expm1,
            sinh: Math.sinh
        }
    },
    {
        name: 'Performance',
        proto: true,
        struct: {
            now: performance.now
        }
    },
    {
        name: 'Element',
        proto: true,
        struct: {
            getBoundingClientRect: randomClient('elementBounding'),
            getClientRects: randomClient('elementRects')
        }
    },
    {
        name: 'Range',
        proto: true,
        struct: {
            getBoundingClientRect: randomClient('rangeBounding'),
            getClientRects: randomClient('rangeRects')
        }
    },
    {
        name: 'WebGLRenderingContext',
        proto: true,
        struct: {
            shaderSource: WebGLRenderingContext.prototype.shaderSource,
            getExtension: WebGLRenderingContext.prototype.getExtension,
            getParameter: computeGetParameter('webgl'),
            getSupportedExtensions: WebGLRenderingContext.prototype.getSupportedExtensions
        }
    },
    {
        name: 'WebGL2RenderingContext',
        proto: true,
        struct: {
            shaderSource: WebGL2RenderingContext.prototype.shaderSource,
            getExtension: WebGL2RenderingContext.prototype.getExtension,
            getParameter: computeGetParameter('webgl2'),
            getSupportedExtensions: WebGL2RenderingContext.prototype.getSupportedExtensions
        }
    },
    {
        name: 'HTMLCanvasElement',
        proto: true,
        struct: {
            getContext: getContext,
            toDataURL: toDataURL,
            toBlob: toBlob
        }
    },
    {
        name: 'CanvasRenderingContext2D',
        proto: true,
        struct: {
            getImageData: getImageData,
            isPointInPath: CanvasRenderingContext2D.prototype.isPointInPath,
            isPointInStroke: CanvasRenderingContext2D.prototype.isPointInStroke,
            measureText: CanvasRenderingContext2D.prototype.measureText
        }
    },
    {
        name: 'AudioBuffer',
        proto: true,
        struct: {
            getChannelData: getChannelData,
            copyFromChannel: copyFromChannel
        }
    },
    {
        name: 'AnalyserNode',
        proto: true,
        struct: {
            getByteFrequencyData: getByteFrequencyData,
            getFloatFrequencyData: getFloatFrequencyData
        }
    },
    {
        name: 'RTCPeerConnection',
        proto: true,
        struct: {
            createDataChannel: RTCPeerConnection.prototype.createDataChannel,
            createOffer: RTCPeerConnection.prototype.createOffer,
            setRemoteDescription: RTCPeerConnection.prototype.setRemoteDescription
        }
    }
    ]
    function definify(struct) {
        const redefinedProps = {}
        Object.keys(struct).forEach(prop => {
            const fn = () => {
                watch(prop)
                return struct[prop]
            }
            Object.defineProperties(fn, {
                name: {
                    value: `${!firefox ? 'get ' : ''}${prop}`,
                    configurable: true
                }
            })
            redefinedProps[prop] = {
                get: fn
            }
        })
        return redefinedProps
    }
    function redefine(root) {
        // Randomized
        apiStructs.forEach(api => {
            const {
                name,
                proto,
                struct
            } = api
            try {
                return Object.defineProperties(
                    (proto ? root[name].prototype : root[name]), definify(struct)
                )
            } catch (error) {
                console.error(error)
            }
        })
        // Deep calls
        Object.defineProperties(root.Intl.DateTimeFormat.prototype, definify(intlProps))
        Object.defineProperties(root.navigator.mediaDevices, definify(mediaDeviceProps))
        // Resist lie detection               
        const library = {
            appVersion: 'appVersion',
            deviceMemory: 'deviceMemory',
            doNotTrack: 'doNotTrack',
            hardwareConcurrency: 'hardwareConcurrency',
            languages: 'languages',
            maxTouchPoints: 'maxTouchPoints',
            mimeTypes: 'mimeTypes',
            platform: 'platform',
            plugins: 'plugins',
            userAgent: 'userAgent',
            vendor: 'vendor',
            connection: 'connection',
            cookieEnabled: 'cookieEnabled',
            getBattery: 'getBattery',
            getGamepads: 'getGamepads',
            width: 'width',
            height: 'height',
            availWidth: 'availWidth',
            availHeight: 'availHeight',
            availTop: 'availTop',
            availLeft: 'availLeft',
            colorDepth: 'colorDepth',
            pixelDepth: 'pixelDepth',
            getTimezoneOffset: 'getTimezoneOffset',
            resolvedOptions: 'resolvedOptions',
            acos: 'acos',
            acosh: 'acosh',
            asin: 'asin',
            asinh: 'asinh',
            cosh: 'cosh',
            expm1: 'expm1',
            sinh: 'sinh',
            enumerateDevices: 'enumerateDevices',
            now: 'now',
            getBoundingClientRect: 'getBoundingClientRect',
            getClientRects: 'getClientRects',
            shaderSource: 'shaderSource',
            getExtension: 'getExtension',
            getParameter: 'getParameter',
            getSupportedExtensions: 'getSupportedExtensions',
            getContext: 'getContext',
            toDataURL: 'toDataURL',
            toBlob: 'toBlob',
            getImageData: 'getImageData',
            isPointInPath: 'isPointInPath',
            isPointInStroke: 'isPointInStroke',
            measureText: 'measureText',
            getChannelData: 'getChannelData',
            copyFromChannel: 'copyFromChannel',
            getByteFrequencyData: 'getByteFrequencyData',
            getFloatFrequencyData: 'getFloatFrequencyData',
            createDataChannel: 'createDataChannel',
            createOffer: 'createOffer',
            setRemoteDescription: 'setRemoteDescription',
        }
        // create Proxy
        const {
            toString
        } = Function.prototype
        const toStringProxy = new Proxy(toString, {
            apply: (target, thisArg, args) => {
                const native = name => {
                    return `function ${name}() {${!firefox ? ' [native code] ' : '\n    [native code]\n'}}`
                }
                const name = thisArg.name
                const propName = name.replace('get ', '')
                if (thisArg === toString.toString) {
                    return native('toString')
                }
                if (propName === library[propName]) {
                    return native(name)
                }
                return target.call(thisArg, ...args)
            }
        })
        root.Function.prototype.toString = toStringProxy
    }
    redefine(window)
    // catch iframes on dom loaded
    const domLoaded = (fn) => document.readyState != 'loading' ?
        fn() : document.addEventListener('DOMContentLoaded', fn)
    domLoaded(() => {
        ;[...document.getElementsByTagName('iframe')].forEach(frame => redefine(frame.contentWindow))
    })
})()
