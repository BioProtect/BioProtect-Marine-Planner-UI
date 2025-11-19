import { CONSTANTS, INITIAL_VARS } from "../bpVars";

const getServerCapabilities = async (server) => {
  console.log("server ", server);
  // Construct the endpoints
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const endpoint = `${wsProtocol}//${window.location.host}/server/`;
  const websocketEndpoint = new WebSocket(endpoint);

  // Initialize server properties
  server = {
    ...server,
    endpoint,
    websocketEndpoint,
    offline: true,
    guestUserEnabled: true,
    corsEnabled: false,
  };

  // Poll the server
  try {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${endpoint}getServerData`, {
      credentials: "include",
      signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Fetch returned a ${response.status} error: ${response.statusText}`
      );
    }

    const json = await response.json();
    if (json.info) {
      // Update server properties based on the response
      const corsEnabled =
        json.serverData.PERMITTED_DOMAINS.includes(window.location.hostname) ||
        server.host === window.location.hostname;

      server = {
        ...server,
        guestUserEnabled: json.serverData.ENABLE_GUEST_USER,
        corsEnabled,
        offline: false,
        machine: json.serverData.MACHINE,
        client_version: json.serverData.MARXAN_CLIENT_VERSION,
        server_version: json.serverData.MARXAN_SERVER_VERSION,
        node: json.serverData.NODE,
        processor: json.serverData.PROCESSOR,
        processor_count: json.serverData.PROCESSOR_COUNT,
        ram: json.serverData.RAM,
        release: json.serverData.RELEASE,
        system: json.serverData.SYSTEM,
        version: json.serverData.VERSION,
        wdpa_version: json.serverData.WDPA_VERSION,
        planning_grid_units_limit: Number(
          json.serverData.PLANNING_GRID_UNITS_LIMIT
        ),
        disk_space: json.serverData.DISK_FREE_SPACE,
        shutdowntime: json.serverData.SHUTDOWNTIME,
        enable_reset: json.serverData.ENABLE_RESET,
        name: json.serverData.SERVER_NAME || server.name,
        description: json.serverData.SERVER_DESCRIPTION || server.description,
      };
    }
  } catch (error) {}
  return server;
};

// function to add the local server
const addLocalServer = (servers) => {
  const newServer = {
    name: window.location.hostname,
    protocol: window.location.protocol,
    host: window.location.hostname,
    port: "",
    description: "Local machine",
    type: "local",
  };
  return [...servers, newServer];
};

// function to filter and sort the servers
const filterAndSortServers = (servers) => {
  const hosts = servers.map((server) => server.host);

  return servers
    .filter(
      (server) =>
        server.type === "remote" ||
        (server.type === "local" && !server.offline) ||
        server.host === "localhost"
    )
    .sort((a, b) => {
      if (a.type === "local" || a.name.toLowerCase() < b.name.toLowerCase())
        return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    });
};

export { addLocalServer, getServerCapabilities, filterAndSortServers };
