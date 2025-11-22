import LayoutMUI from '../../components/LayoutMUI';
import { TalentPoolProvider } from './TalentPool/TalentPoolContext';
import Container from './TalentPool/Container';

const TalentPoolPage = () => {
  return (
    <LayoutMUI>
      <TalentPoolProvider>
        <Container />
      </TalentPoolProvider>
    </LayoutMUI>
  );
};

export default TalentPoolPage;
