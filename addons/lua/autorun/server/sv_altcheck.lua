FAltCheck = {}
FAltCheck.Config = {}
FAltCheck.Cache = {}
FAltCheck.CacheIdx = {}

/*
	Configurable FAltCheck variables. 
	ServerLocation is the base URL of the HTTP API to request. 
	Token is the authorization token, if required. 
	CacheSize is the number of cached ip:steamid links maintained. 
	The higher the cache is, the lower HTTP request volume will be. 
*/

FAltCheck.Config.ServerLocation = ""
FAltCheck.Config.Token = ""
FAltCheck.Config.CacheSize = 500
FAltCheck.Config.CacheFile = "AltCheckCache.dat"

/* Internal utility function for accessing FAltCheck endpoints. 
   Takes a base url, endpoint name, data in JSON format, and success
   and failure callbacks.
*/

function FAltCheck.Request(url, endpoint, data, cbsuccess, cbfailed)
	/*http://wiki.garrysmod.com/page/Global/HTTP
	  Wiki says this may cause crashes, but it 
	  also may be fixed. 
	*/
	
	HTTP({
		success = cbsuccess,
		failed = cbfailed,
		method = 'POST'
		url = url .. endpoint,
		type = 'application/json',
		body = data
	})
end

/* Internal function factory for endpoint validation.
	Returns a function that calls a user supplied function with
	nil, data:table on success or error:string on failure
*/

function FAltCheck._GenSuccessCB(cb)
	return function(code, body, headers) 
		if code == 200 and body and body:len() > 0 then
			cb(nil, util.JSONToTable(body))
		else
			cb("Parse Error")
		end
	end
end

/*
	Player insertion endpoint. Will insert a steamid:string, ip:string key value pair
	into the graph for alt detection. 
*/

function FAltCheck.LinkUser(steamid, ip)
	FAltCheck.Request(FAltCheck.Config.ServerLocation, '/insert', 
		util.TableToJSON({
			ip: ip,
			steamid: steamid,
			token: FAltCheck.Config.Token
		})
	)
end

/*
	IP Check Endpoint. Will return a list of players that have been
	linked to a supplied ip:string. cb is called with (nil, data:table)
	on success, or (error:string) on failure. 
*/

function FAltCheck.FindByIP(ip, cb)
	FAltCheck.Request(FAltCheck.Config.ServerLocation, '/ip', 
		util.TableToJSON({
			ip: ip,
			token: FAltCheck.Config.Token
		}),
		FAltCheck._GenSuccessCB(cb),
		cb
	)
end

/*
	SteamID Check Endpoint. Will return a list of players that have been
	linked to a supplied steamid:string. cb is called with (nil, data:table)
	on success, or (error:string) on failure. 
*/

function FAltCheck.FindBySteamID(ip, cb)
	if not cb then return end
	FAltCheck.Request(FAltCheck.Config.ServerLocation, '/ip', 
		util.TableToJSON({
			steamid: steamid,
			token: FAltCheck.Config.Token
		}),
		FAltCheck._GenSuccessCB(cb),
		cb
	)
end

/*
	Cache check function. Given steamid:string and ip:string, 
	will check if existent in cache hash table. If not, will
	insert into the hashmap. Also maintains linked list for 
	for rotating stale cache entries. 
*/

function FAltCheck.CheckCached(steamid, ip)
	local key = steamid .. ip
	if FAltCheck.Cache[key] then return true end
	FAltCheck.Cache[key] = true
	table.insert(FAltCheck.CacheIdx, key)
	if #FAltCheck.CacheIdx >= FAltCheck.Config.CacheSize then
		local key = table.remove(FAltCheck.CacheIdx, 1)
		FAltCheck.Cache[key] = nil
	end
end

hook.Add("PlayerInitialSpawn", "AltCheck--", function(ply)
	local ip = ply:IPAddress():gsub(":%d*", "")
	local steamid = ply:SteamID64()
	if FAltCheck.CheckCached(steamid, ip) then return end
	FAltCheck.LinkUser(steamid, ip)
end)

hook.Add("Initialize", "FAltCheckLoadData", function()
	local f = file.Open(FAltCheck.Config.CacheFile, "rb", "DATA")
	if not f then return end
	
	local idxDataLen = f:ReadULong()
	local hashDataLen = f:ReadULong()
	local idxData = f:Read(idxDataLen) or ""
	local hashData = f:Read(hashDataLen) or ""
	
	FAltCheck.Cache = util.JSONToTable(util.Decompress(hashData) or "") or {}
	FAltCheck.CacheIdx = util.JSONToTable(util.Decompress(idxData) or "") or {}
	
	f:Close()
end)

hook.Add("ShutDown", "AltCheckShutDown", function()
	local f = file.Open(FAltCheck.Config.CacheFile, "wb", "DATA")
	if not f then return end
	
	local hashCompress = util.Compress(util.TableToJSON(FAltCheck.Cache) or "") or ""
	local idxCompress = util.Compress(util.TableToJSON(FAltCheck.CacheIdx) or "") or ""
	
	f:WriteULong(idxCompress:len())
	f:WriteULong(hashCompress:len())
	local idxData = f:Read(idxDataLen) or ""
	local hashData = f:Read(hashDataLen) or ""
	
	f:Write(idxCompress)
	f:Write(hashCompress)
	
	f:Close()
end)