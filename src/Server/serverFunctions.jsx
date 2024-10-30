import CONSTANTS from "../constants";

const getServerCapabilities = async (server) => {
  // Construct the endpoints
  const endpoint = `${server.protocol}//${server.host}:${server.port}${CONSTANTS.TORNADO_PATH}`;
  const websocketEndpoint =
    server.protocol === "http:"
      ? `ws://${server.host}:${server.port}${CONSTANTS.TORNADO_PATH}`
      : `wss://${server.host}:${server.port}${CONSTANTS.TORNADO_PATH}`;

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
    console.log("SERVER DATA in serverFunctiosn json ", json);
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
  } catch (error) {
    console.error(`Fetch failed with: ${error}`);
  }
  return server;
};

// function to add the local server
const addLocalServer = (servers) => {
  const currentDomain =
    window.location.hostname === "localhost"
      ? "localhost"
      : window.location.hostname;

  return servers.push({
    name: currentDomain,
    protocol: window.location.protocol,
    host: window.location.hostname,
    port: 5000,
    description: "Local machine",
    type: "local",
  });
};

// function to filter and sort the servers
const filterAndSortServers = (servers) => {
  const hosts = servers.map((server) => server.host);

  return servers
    .filter(
      (server) =>
        server.type === "remote" ||
        (server.type === "local" &&
          !server.offline &&
          hosts.indexOf(server.host) === -1) ||
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
