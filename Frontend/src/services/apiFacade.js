// Re-exporta el Facade completo desde `src/apiFacade.js` para uso unificado en toda la app
import { apiFacade as fullFacade } from '../apiFacade';

export default fullFacade;
export const apiFacade = fullFacade;
