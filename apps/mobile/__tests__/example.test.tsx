import { render } from '@testing-library/react-native';
import Example from '@/components/Example';


describe('<Example/ >', () => {
  it('renders the welcome text', () => {
    const { getByText } = render(<Example/>);
    expect(getByText('Welcome To Beacon')).toBeTruthy();
  });
});
