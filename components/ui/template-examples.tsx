import React from 'react';
import { 
  CardTemplate, 
  ButtonTemplate, 
  InputTemplate, 
  BadgeTemplate 
} from './component-template';

export const TemplateExamples = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Component Templates</h2>
        <p className="text-muted-foreground mb-6">
          Examples of how to use component templates with size, shape, and style variants.
        </p>
      </div>

      {/* Card Templates */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Card Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardTemplate variant="default" size="md">
            <h4 className="font-semibold">Default Card</h4>
            <p className="text-sm text-muted-foreground">Standard card design</p>
          </CardTemplate>
          
          <CardTemplate variant="medical" size="lg" shape="large">
            <h4 className="font-semibold">Medical Card</h4>
            <p className="text-sm text-muted-foreground">Healthcare-themed styling</p>
          </CardTemplate>
          
          <CardTemplate variant="elevated" size="sm" shape="pill">
            <h4 className="font-semibold">Elevated Card</h4>
            <p className="text-sm text-muted-foreground">With enhanced shadows</p>
          </CardTemplate>
        </div>
      </section>

      {/* Button Templates */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Button Templates</h3>
        <div className="flex flex-wrap gap-3">
          <ButtonTemplate variant="default" size="sm">Default</ButtonTemplate>
          <ButtonTemplate variant="medical" size="md">Medical</ButtonTemplate>
          <ButtonTemplate variant="outline" size="lg" shape="pill">Outlined Pill</ButtonTemplate>
          <ButtonTemplate variant="gradient" size="xl" shape="rounded">Gradient</ButtonTemplate>
          <ButtonTemplate variant="ghost" size="icon" shape="circle">[hospital]</ButtonTemplate>
        </div>
      </section>

      {/* Input Templates */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Input Templates</h3>
        <div className="space-y-4 max-w-md">
          <InputTemplate 
            placeholder="Default input" 
            variant="default" 
            size="md" 
          />
          <InputTemplate 
            placeholder="Medical themed input" 
            variant="medical" 
            size="lg" 
          />
          <InputTemplate 
            placeholder="Filled input" 
            variant="filled" 
            size="md" 
          />
          <InputTemplate 
            placeholder="Error state" 
            variant="outlined" 
            state="error" 
            size="md" 
          />
          <InputTemplate 
            placeholder="Success state" 
            variant="default" 
            state="success" 
            size="sm" 
          />
        </div>
      </section>

      {/* Badge Templates */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Badge Templates</h3>
        <div className="flex flex-wrap gap-2">
          <BadgeTemplate variant="default" size="sm">Default</BadgeTemplate>
          <BadgeTemplate variant="medical" size="md">Medical</BadgeTemplate>
          <BadgeTemplate variant="success" size="lg" shape="square">Success</BadgeTemplate>
          <BadgeTemplate variant="warning" size="xs">Warning</BadgeTemplate>
          <BadgeTemplate variant="destructive" size="md" shape="pill">Error</BadgeTemplate>
          <BadgeTemplate variant="outline" size="sm">Outlined</BadgeTemplate>
        </div>
      </section>

      {/* Usage Code Examples */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Usage Examples</h3>
        <CardTemplate variant="outlined" size="lg" className="font-mono text-sm">
          <div className="space-y-2">
            <div className="text-success">// Card with variants:</div>
            <div>&lt;CardTemplate variant="medical" size="lg" shape="large"&gt;</div>
            <div className="ml-4">Content here</div>
            <div>&lt;/CardTemplate&gt;</div>
            
            <div className="text-success mt-4">// Button with variants:</div>
            <div>&lt;ButtonTemplate variant="gradient" size="xl" shape="pill"&gt;</div>
            <div className="ml-4">Click me</div>
            <div>&lt;/ButtonTemplate&gt;</div>
            
            <div className="text-success mt-4">// Input with state:</div>
            <div>&lt;InputTemplate variant="medical" state="error" size="lg" /&gt;</div>
          </div>
        </CardTemplate>
      </section>
    </div>
  );
};