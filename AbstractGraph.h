#ifndef ABSTRACT_GRAPH
#define ABSTRACT_GRAPH

#include <QGLWidget>
#include <string>
#include <vector>
#include "BasicTypes.h"
#include "TextureCanvas.h"
/**
*  This is the base class for all Grapher objects.
*/

class GLWidget;
class QScrollArea;
class QAction;
class UiVariables;

using namespace std;

class AbstractGraph : public QGLWidget
{
    Q_OBJECT	
	
protected:
	int frameCount;
	const string* sequence;
	QScrollArea* settingsTab;
    GLuint display_object;

public:
	GLWidget* glWidget;
	UiVariables* ui;	
    TextureCanvas* textureBuffer;
	
	bool hidden;
	bool upToDate;
    bool usingTextures;
	QAction* toggleButton;

	string actionLabel;
	string actionTooltip;
	string actionData; 
	
    AbstractGraph();
    AbstractGraph(UiVariables* gui, GLWidget* gl);
	~AbstractGraph();
	virtual int width();

	virtual int height();
	virtual void paint_square(point position, color c);
    virtual void storeDisplay(vector<color>& pixels, int width, bool raggedEdge = false);
	virtual bool updateInt(int& subject, int& value);
	virtual bool updateVal(double& subject, double& value);
	virtual void display() = 0;
	virtual void displayLegend(float canvasWidth, float canvasHeight);
	virtual void checkVariables();
	virtual void ensureVisible();
	virtual GLuint render() = 0;
	virtual void setButtonFont();
	virtual void setSequence(const string* seq);
	virtual string mouseClick(point2D pt);
	virtual string getFileName();
	virtual QScrollArea* settingsUi();
	string reverseComplement(string original);
    virtual int current_display_size();
	
inline char complement(char a)
{
	if(a == 'A') return 'T';
	if(a == 'C') return 'G';
	if(a == 'G') return 'C';
	if(a == 'T') return 'A';
	return a;
}

public slots:
	void invalidate();
    void toggleVisibility();
	
signals:
	void displayChanged();
	void hideSettings(QScrollArea*);
    void showSettings(QScrollArea*);
    void deleteButton(QAction*);
	
};

#endif
