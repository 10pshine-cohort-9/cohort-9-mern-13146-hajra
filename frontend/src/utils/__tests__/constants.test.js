import { APP_NAME, API_BASE_URL } from '../constants';

describe('constants', () => {
  it('exports the correct app name', () => {
    expect(APP_NAME).toBe('Notes App');
  });

  it('exports a defined API base URL', () => {
    expect(API_BASE_URL).toBeDefined();
  });
});